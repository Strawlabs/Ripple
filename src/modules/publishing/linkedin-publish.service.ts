import { supabaseServer } from '@/lib/supabase-server';
import { ApprovalError, getDraft } from './approval.service';

export class PublishError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

/**
 * FEATURE-005 — Social Publishing (LinkedIn)
 *
 * BR-APR-001 gate: only drafts with status 'approved' may be published.
 * On success, marks the draft 'published' and stores the LinkedIn post id.
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

    return { draft: data, linkedinPostId };
}