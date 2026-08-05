import { NextRequest } from 'next/server';
import { updateScheduleSchema } from '@/validations/schedule';
import { rescheduleSchedule, cancelSchedule, getScheduleBrandId, ScheduleError } from '@/modules/scheduling/schedule.service';
import { requireAuth, requireBrandAccess, AuthenticationError } from '@/modules/auth/require-auth';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const parsed = updateScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten());
  }

  try {
    const user = await requireAuth(req);
    const brandId = await getScheduleBrandId(id);
    await requireBrandAccess(user, brandId);

    const updated = await rescheduleSchedule(id, parsed.data);
    return apiSuccess(updated);
  } catch (err) {
    if (err instanceof AuthenticationError) return apiError(err.message, err.status);
    if (err instanceof ScheduleError) return apiError(err.message, err.status);
    console.error('Unexpected error in PATCH /api/posts/schedule/[id]:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await requireAuth(req);
    const brandId = await getScheduleBrandId(id);
    await requireBrandAccess(user, brandId);

    const cancelled = await cancelSchedule(id);
    return apiSuccess(cancelled);
  } catch (err) {
    if (err instanceof AuthenticationError) return apiError(err.message, err.status);
    if (err instanceof ScheduleError) return apiError(err.message, err.status);
    console.error('Unexpected error in DELETE /api/posts/schedule/[id]:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
