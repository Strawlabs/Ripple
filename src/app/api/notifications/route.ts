import { NextRequest } from 'next/server';
import { listNotifications, NotificationError } from '@/modules/notifications/notification.service';
import { requireAuth, AuthenticationError } from '@/modules/auth/require-auth';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const unreadOnly = req.nextUrl.searchParams.get('unreadOnly') === 'true';
    const items = await listNotifications(user.id, unreadOnly);
    return apiSuccess({ items });
  } catch (err) {
    if (err instanceof AuthenticationError) return apiError(err.message, err.status);
    if (err instanceof NotificationError) return apiError(err.message, err.status);
    console.error('Unexpected error in GET /api/notifications:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
