import { NextRequest } from 'next/server';
import { updateScheduleSchema } from '@/validations/schedule';
import { rescheduleSchedule, cancelSchedule, ScheduleError } from '@/modules/scheduling/schedule.service';
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
    const updated = await rescheduleSchedule(id, parsed.data);
    return apiSuccess(updated);
  } catch (err) {
    if (err instanceof ScheduleError) return apiError(err.message, err.status);
    console.error('Unexpected error in PATCH /api/posts/schedule/[id]:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cancelled = await cancelSchedule(id);
    return apiSuccess(cancelled);
  } catch (err) {
    if (err instanceof ScheduleError) return apiError(err.message, err.status);
    console.error('Unexpected error in DELETE /api/posts/schedule/[id]:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
