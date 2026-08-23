import { NextRequest } from 'next/server';
import { sendDueReminders } from '@/modules/scheduling/send-reminders';
import { apiSuccess, apiError } from '@/utils/api-response';

/**
 * Meant to be called by a scheduled job (e.g. Vercel Cron) every few
 * minutes, same pattern as /api/cron/process-scheduled — protected by
 * CRON_SECRET if set, open otherwise (fine for local dev/demo only).
 */
export async function POST(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (secret) {
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${secret}`) {
            return apiError('Unauthorized', 401);
        }
    }

    try {
        const sent = await sendDueReminders();
        return apiSuccess({ remindersSent: sent });
    } catch (err) {
        console.error('Unexpected error in POST /api/cron/send-reminders:', err);
        return apiError('Something went wrong. Please try again.', 500);
    }
}
