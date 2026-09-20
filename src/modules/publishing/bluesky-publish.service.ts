import { supabaseServer } from '@/lib/supabase-server';
import { getDraft } from './approval.service';
import { createNotification } from '@/modules/notifications/notification.service';
import { PublishError } from './linkedin-publish.service';

const POST_MAX_LENGTH = 300;

async function getBrandOwner(brandId: string): Promise<{ userId: string; companyName: string } | null> {
    const { data } = await supabaseServer
        .from('brands')
        .select('user_id, company_name')
        .eq('id', brandId)
        .maybeSingle();
    if (!data) return null;
    return { userId: data.user_id, companyName: data.company_name };
}

/**
 * Social Publishing (Bluesky / AT Protocol)
 *
 * Mirrors publishToTwitter() — same BR-APR-001 approval gate, same
 * published_posts row + publish_success/publish_failure notifications.
 *
 * Bluesky has no OAuth — we store the account's handle (platform_user_id)
 * and an "app password" (access_token, generated in Bluesky settings, not
 * the account's real password). At publish time we create a fresh session
 * with com.atproto.server.createSession, then post with
 * com.atproto.repo.createRecord. App passwords don't expire on their own,
 * so there is no refresh-token flow to implement here.
 */
export async function publishToBluesky(draftId: string) {
    const draft = await getDraft(draftId);

    if (draft.status !== 'approved') {
        throw new PublishError(
            `Cannot publish a draft with status '${draft.status}'. It must be approved first.`,
            409
        );
    }

    if (!draft.bluesky_content) {
        throw new PublishError('This draft has no Bluesky content.', 400);
    }

    if (draft.bluesky_content.length > POST_MAX_LENGTH) {
        throw new PublishError(
            `This post is ${draft.bluesky_content.length} characters — Bluesky allows a maximum of ${POST_MAX_LENGTH}. Edit it before publishing.`,
            400
        );
    }

    const owner = await getBrandOwner(draft.brand_id);

    const { data: socialAccount, error: socialError } = await supabaseServer
        .from('social_accounts')
        .select('access_token, platform_user_id, status')
        .eq('brand_id', draft.brand_id)
        .eq('platform', 'Bluesky')
        .maybeSingle();

    if (socialError) {
        throw new PublishError('Could not look up Bluesky connection.', 500);
    }
    if (!socialAccount || socialAccount.status !== 'connected' || !socialAccount.access_token || !socialAccount.platform_user_id) {
        throw new PublishError('Bluesky is not connected for this brand. Connect it in Social Accounts.', 400);
    }

    // 1. Create a fresh session (app passwords don't expire, so we just
    //    log in again each time instead of maintaining a refresh flow).
    const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            identifier: socialAccount.platform_user_id,
            password: socialAccount.access_token,
        }),
    });
    const sessionData = await sessionRes.json().catch(() => ({}));

    if (!sessionRes.ok) {
        console.error('Bluesky session failed:', sessionRes.status, sessionData);

        if (owner) {
            void createNotification(
                owner.userId,
                'publish_failure',
                'Bluesky post failed to publish',
                `A Bluesky post for ${owner.companyName} failed to publish. You can retry from Content Library.`,
                { draftId, platform: 'bluesky' }
            );
        }

        throw new PublishError(
            'Could not log in to Bluesky. Please reconnect Bluesky in Social Accounts.',
            401
        );
    }

    const { accessJwt, did } = sessionData;

    // 2. Create the post record.
    const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessJwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            repo: did,
            collection: 'app.bsky.feed.post',
            record: {
                text: draft.bluesky_content,
                createdAt: new Date().toISOString(),
                $type: 'app.bsky.feed.post',
            },
        }),
    });
    const postData = await postRes.json().catch(() => ({}));

    if (!postRes.ok) {
        console.error('Bluesky publish failed:', postRes.status, postData);

        if (owner) {
            void createNotification(
                owner.userId,
                'publish_failure',
                'Bluesky post failed to publish',
                `A Bluesky post for ${owner.companyName} failed to publish. You can retry from Content Library.`,
                { draftId, platform: 'bluesky' }
            );
        }

        throw new PublishError('Bluesky rejected the post. Please try again.', 502);
    }

    // postData.uri looks like at://did:plc:xxxx/app.bsky.feed.post/<rkey>
    const postId: string | null = postData?.uri ?? null;

    const { data, error } = await supabaseServer
        .from('content_drafts')
        .update({ status: 'published' })
        .eq('id', draftId)
        .select()
        .single();

    if (error) throw new PublishError('Post was published but failed to update draft status.', 500);

    const { error: publishedPostError } = await supabaseServer.from('published_posts').insert({
        draft_id: draftId,
        platform: 'bluesky',
        external_post_id: postId,
    });
    if (publishedPostError) {
        console.error('Failed to record published_posts row:', publishedPostError.message);
    }

    if (owner) {
        void createNotification(
            owner.userId,
            'publish_success',
            'Bluesky post published',
            `Your Bluesky post for ${owner.companyName} is now live.`,
            { draftId, platform: 'bluesky', postId }
        );
    }

    return { draft: data, postId };
}