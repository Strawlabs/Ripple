import { NextRequest } from 'next/server';
import { markAsRead, NotificationError } from '@/modules/notifications/notification.service';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const notification = await markAsRead(id);
    return apiSuccess(notification);
  } catch (err) {
    if (err instanceof NotificationError) return apiError(err.message, err.status);
    console.error('Unexpected error in PATCH /api/notifications/[id]/read:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
