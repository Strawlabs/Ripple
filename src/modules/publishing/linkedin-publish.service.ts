import { supabaseServer } from '@/lib/supabase-server';
import { ApprovalError, getDraft } from './approval.service';
import { createNotification } from '@/modules/notifications/notification.service';

export class PublishError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

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
 * FEATURE-005 — Social Publishing (LinkedIn)
 *
 * BR-APR-001 gate: only drafts with status 'approved' may be published.
 * On success:
 *  - marks the draft 'published'
 *  - inserts a row into published_posts (this is what the Analytics
 *    Dashboard and Dashboard stat cards read — without this row,
 *    a real LinkedIn publish would be invisible to both)
 *  - fires a 'publish_success' notification (BR-PUB-002 — status tracked)
 * On the LinkedIn API rejecting the post, fires 'publish_failure'
 * before throwing (BR-PUB-003 — failed posts must be retriable; the
 * notification tells the user so they know to retry).
 */
export async function publishToLinkedIn(draftId: string) {
    const draft = await getDraft(draftId);

    if (draft.status !== 'approved') {
        throw new PublishError(
            `Cannot publish a draft with status '${draft.status}'. It must be approved first.`,
            409
        );
    }

    if (!draft.linkedin_content) {
        throw new PublishError('This draft has no LinkedIn content.', 400);
    }

    const owner = await getBrandOwner(draft.brand_id);

    const { data: socialAccount, error: socialError } = await supabaseServer
        .from('social_accounts')
        .select('access_token, platform_user_id, status')
        .eq('brand_id', draft.brand_id)
        .eq('platform', 'LinkedIn')
        .maybeSingle();

    if (socialError) {
        throw new PublishError('Could not look up LinkedIn connection.', 500);
    }
    if (!socialAccount || socialAccount.status !== 'connected' || !socialAccount.access_token) {
        throw new PublishError('LinkedIn is not connected for this brand. Connect it in Social Accounts.', 400);
    }

    const linkedinRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${socialAccount.access_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
            author: `urn:li:person:${socialAccount.platform_user_id}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: { text: draft.linkedin_content },
                    shareMediaCategory: 'NONE',
                },
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
        }),
    });

    if (!linkedinRes.ok) {
        const errText = await linkedinRes.text();
        console.error('LinkedIn publish failed:', errText);

        if (owner) {
            void createNotification(
                owner.userId,
                'publish_failure',
                'LinkedIn post failed to publish',
                `A LinkedIn post for ${owner.companyName} failed to publish. You can retry from Content Library.`,
                { draftId, platform: 'linkedin' }
            );
        }

        throw new PublishError('LinkedIn rejected the post. Please try again.', 502);
    }

    const linkedinPostId = linkedinRes.headers.get('x-restli-id');

    const { data, error } = await supabaseServer
        .from('content_drafts')
        .update({ status: 'published' })
        .eq('id', draftId)
        .select()
        .single();

    if (error) throw new PublishError('Post was published but failed to update draft status.', 500);

    // BR-PUB-002: publishing status must be tracked. This is what the
    // Analytics Dashboard and Dashboard stat cards actually read —
    // without this row, a real publish is invisible to both.
    const { error: publishedPostError } = await supabaseServer.from('published_posts').insert({
        draft_id: draftId,
        platform: 'linkedin',
        external_post_id: linkedinPostId,
    });
    if (publishedPostError) {
        console.error('Failed to record published_posts row:', publishedPostError.message);
    }

    if (owner) {
        void createNotification(
            owner.userId,
            'publish_success',
            'LinkedIn post published',
            `Your LinkedIn post for ${owner.companyName} is now live.`,
            { draftId, platform: 'linkedin', linkedinPostId }
        );
    }

    return { draft: data, linkedinPostId };
}