import { NextRequest } from 'next/server';
import { processDuePosts } from '@/modules/scheduling/process-due-posts';
import { apiSuccess, apiError } from '@/utils/api-response';

/**
 * Meant to be called by a scheduled job (e.g. Vercel Cron) every few
 * minutes, not by end users — protected by a shared secret rather than
 * a user session.
 *
 * Set CRON_SECRET in .env.local and pass it as:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * If CRON_SECRET isn't set, the endpoint is open — fine for local
 * dev/demo, NOT fine for production. Set it before deploying.
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
        const results = await processDuePosts();
        return apiSuccess({ processed: results.length, results });
    } catch (err) {
        console.error('Unexpected error in POST /api/cron/process-scheduled:', err);
        return apiError('Something went wrong. Please try again.', 500);
    }
}
