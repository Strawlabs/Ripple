import { NextRequest } from 'next/server';
import { listNotifications, NotificationError } from '@/modules/notifications/notification.service';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return apiError('userId query param is required', 400);
  }
  const unreadOnly = req.nextUrl.searchParams.get('unreadOnly') === 'true';

  try {
    const items = await listNotifications(userId, unreadOnly);
    return apiSuccess({ items });
  } catch (err) {
    if (err instanceof NotificationError) return apiError(err.message, err.status);
    console.error('Unexpected error in GET /api/notifications:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
