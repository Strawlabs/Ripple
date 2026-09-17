import { supabaseServer } from '@/lib/supabase-server';
import { getDraft } from './approval.service';
import { createNotification } from '@/modules/notifications/notification.service';
import { PublishError } from './linkedin-publish.service';

const TWEET_MAX_LENGTH = 280;

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
 * FEATURE-005 — Social Publishing (X / Twitter)
 *
 * Mirrors publishToLinkedIn() — same BR-APR-001 approval gate, same
 * published_posts row + publish_success/publish_failure notifications.
 *
 * Two things specific to X:
 *  - Hard 280-character limit, checked before calling the API so the
 *    user gets a clear message instead of an opaque API rejection.
 *  - Access tokens expire after ~2 hours. We store the refresh token at
 *    connect time, but automatic refresh is NOT implemented yet — a 401
 *    surfaces as "reconnect X" guidance. See module README.
 */
export async function publishToTwitter(draftId: string) {
    const draft = await getDraft(draftId);

    if (draft.status !== 'approved') {
        throw new PublishError(
            `Cannot publish a draft with status '${draft.status}'. It must be approved first.`,
            409
        );
    }

    if (!draft.twitter_content) {
        throw new PublishError('This draft has no X content.', 400);
    }

    if (draft.twitter_content.length > TWEET_MAX_LENGTH) {
        throw new PublishError(
            `This post is ${draft.twitter_content.length} characters — X allows a maximum of ${TWEET_MAX_LENGTH}. Edit it before publishing.`,
            400
        );
    }

    const owner = await getBrandOwner(draft.brand_id);

    const { data: socialAccount, error: socialError } = await supabaseServer
        .from('social_accounts')
        .select('access_token, status')
        .eq('brand_id', draft.brand_id)
        .eq('platform', 'Twitter')
        .maybeSingle();

    if (socialError) {
        throw new PublishError('Could not look up X connection.', 500);
    }
    if (!socialAccount || socialAccount.status !== 'connected' || !socialAccount.access_token) {
        throw new PublishError('X is not connected for this brand. Connect it in Social Accounts.', 400);
    }

    const tweetRes = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${socialAccount.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: draft.twitter_content }),
    });

    const tweetData = await tweetRes.json().catch(() => ({}));

    if (!tweetRes.ok) {
        console.error('X publish failed:', tweetRes.status, tweetData);

        if (owner) {
            void createNotification(
                owner.userId,
                'publish_failure',
                'X post failed to publish',
                `An X post for ${owner.companyName} failed to publish. You can retry from Content Library.`,
                { draftId, platform: 'twitter' }
            );
        }

        const isAuthError = tweetRes.status === 401;
        throw new PublishError(
            isAuthError
                ? 'X access has expired. Please reconnect X in Social Accounts.'
                : 'X rejected the post. Please try again.',
            isAuthError ? 401 : 502
        );
    }

    const tweetId: string | null = tweetData?.data?.id ?? null;

    const { data, error } = await supabaseServer
        .from('content_drafts')
        .update({ status: 'published' })
        .eq('id', draftId)
        .select()
        .single();

    if (error) throw new PublishError('Post was published but failed to update draft status.', 500);

    const { error: publishedPostError } = await supabaseServer.from('published_posts').insert({
        draft_id: draftId,
        platform: 'twitter',
        external_post_id: tweetId,
    });
    if (publishedPostError) {
        console.error('Failed to record published_posts row:', publishedPostError.message);
    }

    if (owner) {
        void createNotification(
            owner.userId,
            'publish_success',
            'X post published',
            `Your X post for ${owner.companyName} is now live.`,
            { draftId, platform: 'twitter', tweetId }
        );
    }

    return { draft: data, tweetId };
}
