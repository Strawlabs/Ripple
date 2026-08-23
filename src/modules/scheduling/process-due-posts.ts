import { supabaseServer } from '@/lib/supabase-server';
import { publishToLinkedIn } from '@/modules/publishing/linkedin-publish.service';
import { publishToFacebook } from '@/modules/publishing/facebook-publish.service';

export interface ProcessResult {
    scheduledPostId: string;
    draftId: string;
    attempted: string[];
    succeeded: string[];
    failed: { platform: string; error: string }[];
}

/**
 * FEATURE-006 — Scheduling Engine (auto-publish worker)
 *
 * Finds scheduled_posts that are due (status='pending', scheduled_at <= now)
 * and publishes each one. A schedule isn't tied to one platform — it's
 * tied to a draft, which may have content for multiple platforms — so
 * this attempts every platform that has both content on the draft AND
 * a connected social account, and considers the schedule 'completed'
 * if at least one platform succeeded.
 *
 * Deliberately reuses publishToLinkedIn()/publishToFacebook() as-is
 * (already tested, already fire notifications and write published_posts)
 * rather than duplicating that logic here.
 *
 * Trigger: intended to run on a schedule (e.g. a Vercel Cron Job hitting
 * POST /api/cron/process-scheduled every few minutes). Can also be
 * triggered manually for testing/demo purposes.
 */
export async function processDuePosts(): Promise<ProcessResult[]> {
    const { data: duePosts, error } = await supabaseServer
        .from('scheduled_posts')
        .select('id, draft_id, content_drafts!inner(linkedin_content, facebook_content)')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString());

    if (error) {
        console.error('Failed to load due scheduled posts:', error.message);
        return [];
    }
    if (!duePosts || duePosts.length === 0) return [];

    const results: ProcessResult[] = [];

    for (const post of duePosts as unknown as Array<{
        id: string;
        draft_id: string;
        content_drafts: { linkedin_content: string | null; facebook_content: string | null };
    }>) {
        const result: ProcessResult = {
            scheduledPostId: post.id,
            draftId: post.draft_id,
            attempted: [],
            succeeded: [],
            failed: [],
        };

        if (post.content_drafts.linkedin_content) {
            result.attempted.push('linkedin');
            try {
                await publishToLinkedIn(post.draft_id);
                result.succeeded.push('linkedin');
            } catch (err) {
                result.failed.push({ platform: 'linkedin', error: err instanceof Error ? err.message : String(err) });
            }
        }

        if (post.content_drafts.facebook_content) {
            result.attempted.push('facebook');
            try {
                await publishToFacebook(post.draft_id);
                result.succeeded.push('facebook');
            } catch (err) {
                result.failed.push({ platform: 'facebook', error: err instanceof Error ? err.message : String(err) });
            }
        }

        // Mark 'completed' if anything succeeded, 'failed' if every
        // attempted platform failed, or if there was nothing to publish
        // (draft had no content for any platform — shouldn't normally
        // happen, but don't leave it stuck as 'pending' forever).
        const newStatus = result.succeeded.length > 0 ? 'completed' : 'failed';
        await supabaseServer.from('scheduled_posts').update({ status: newStatus }).eq('id', post.id);

        results.push(result);
    }

    return results;
}
