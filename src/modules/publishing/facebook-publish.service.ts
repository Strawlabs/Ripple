import { supabaseServer } from '@/lib/supabase-server';
import { getDraft } from './approval.service';
import { createNotification } from '@/modules/notifications/notification.service';
import { PublishError } from './linkedin-publish.service';

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
 * FEATURE-005 — Social Publishing (Facebook)
 *
 * Mirrors publishToLinkedIn() in linkedin-publish.service.ts — same
 * BR-APR-001 gate, same published_posts + notification wiring. Posts
 * to a Facebook Page (not a personal profile) using the Page access
 * token saved by the Facebook OAuth callback, via the Page's /feed edge.
 */
export async function publishToFacebook(draftId: string) {
    const draft = await getDraft(draftId);

    if (draft.status !== 'approved') {
        throw new PublishError(
            `Cannot publish a draft with status '${draft.status}'. It must be approved first.`,
            409
        );
    }

    if (!draft.facebook_content) {
        throw new PublishError('This draft has no Facebook content.', 400);
    }

    const owner = await getBrandOwner(draft.brand_id);

    const { data: socialAccount, error: socialError } = await supabaseServer
        .from('social_accounts')
        .select('access_token, platform_user_id, status')
        .eq('brand_id', draft.brand_id)
        .eq('platform', 'Facebook')
        .maybeSingle();

    if (socialError) {
        throw new PublishError('Could not look up Facebook connection.', 500);
    }
    if (!socialAccount || socialAccount.status !== 'connected' || !socialAccount.access_token || !socialAccount.platform_user_id) {
        throw new PublishError('Facebook is not connected for this brand. Connect it in Social Accounts.', 400);
    }

    const fbRes = await fetch(
        `https://graph.facebook.com/v21.0/${socialAccount.platform_user_id}/feed`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: draft.facebook_content,
                access_token: socialAccount.access_token,
            }),
        }
    );

    const fbData = await fbRes.json();

    if (!fbRes.ok) {
        console.error('Facebook publish failed:', fbData);

        if (owner) {
            void createNotification(
                owner.userId,
                'publish_failure',
                'Facebook post failed to publish',
                `A Facebook post for ${owner.companyName} failed to publish. You can retry from Content Library.`,
                { draftId, platform: 'facebook' }
            );
        }

        // Facebook access tokens for Pages don't expire on a fixed
        // schedule but can be revoked — surface that distinctly so the
        // UI can eventually prompt a re-auth flow (BR-PUB re-auth, not
        // built yet — see module README).
        const isAuthError = fbData?.error?.code === 190;
        throw new PublishError(
            isAuthError
                ? 'Facebook access has expired. Please reconnect Facebook in Social Accounts.'
                : 'Facebook rejected the post. Please try again.',
            isAuthError ? 401 : 502
        );
    }

    const facebookPostId: string | null = fbData.id ?? null;

    const { data, error } = await supabaseServer
        .from('content_drafts')
        .update({ status: 'published' })
        .eq('id', draftId)
        .select()
        .single();

    if (error) throw new PublishError('Post was published but failed to update draft status.', 500);

    const { error: publishedPostError } = await supabaseServer.from('published_posts').insert({
        draft_id: draftId,
        platform: 'facebook',
        external_post_id: facebookPostId,
    });
    if (publishedPostError) {
        console.error('Failed to record published_posts row:', publishedPostError.message);
    }

    if (owner) {
        void createNotification(
            owner.userId,
            'publish_success',
            'Facebook post published',
            `Your Facebook post for ${owner.companyName} is now live.`,
            { draftId, platform: 'facebook', facebookPostId }
        );
    }

    return { draft: data, facebookPostId };
}
