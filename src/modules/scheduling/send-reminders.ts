import { supabaseServer } from '@/lib/supabase-server';
import { createNotification } from '@/modules/notifications/notification.service';

const REMINDER_WINDOW_MINUTES = 15;

/**
 * FEATURE-012 — Notification Center: 'schedule_reminder'
 *
 * Finds scheduled_posts that are due to publish within the next
 * REMINDER_WINDOW_MINUTES and haven't been reminded about yet, and
 * fires a 'schedule_reminder' notification to the brand owner.
 *
 * Uses the notifications table itself to track "already reminded"
 * (checks for an existing schedule_reminder notification whose
 * metadata.scheduledPostId matches) rather than adding a new column —
 * avoids a migration for a single boolean flag.
 *
 * Meant to run on the same cadence as processDuePosts() (e.g. a cron
 * job every few minutes) — see POST /api/cron/send-reminders.
 */
export async function sendDueReminders(): Promise<number> {
    const windowEnd = new Date(Date.now() + REMINDER_WINDOW_MINUTES * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const { data: upcoming, error } = await supabaseServer
        .from('scheduled_posts')
        .select('id, scheduled_at, content_drafts!inner(brand_id)')
        .eq('status', 'pending')
        .gte('scheduled_at', now)
        .lte('scheduled_at', windowEnd);

    if (error) {
        console.error('Failed to load upcoming scheduled posts:', error.message);
        return 0;
    }
    if (!upcoming || upcoming.length === 0) return 0;

    let sent = 0;

    for (const post of upcoming as unknown as Array<{
        id: string;
        scheduled_at: string;
        content_drafts: { brand_id: string };
    }>) {
        const { data: alreadyReminded } = await supabaseServer
            .from('notifications')
            .select('id')
            .eq('type', 'schedule_reminder')
            .contains('metadata', { scheduledPostId: post.id })
            .maybeSingle();

        if (alreadyReminded) continue;

        const { data: brand } = await supabaseServer
            .from('brands')
            .select('user_id, company_name')
            .eq('id', post.content_drafts.brand_id)
            .maybeSingle();

        if (!brand) continue;

        const minutesUntil = Math.round((new Date(post.scheduled_at).getTime() - Date.now()) / 60000);

        await createNotification(
            brand.user_id,
            'schedule_reminder',
            'Post publishing soon',
            `A scheduled post for ${brand.company_name} will publish in about ${minutesUntil} minute${minutesUntil === 1 ? '' : 's'}.`,
            { scheduledPostId: post.id, scheduledAt: post.scheduled_at }
        );
        sent += 1;
    }

    return sent;
}
