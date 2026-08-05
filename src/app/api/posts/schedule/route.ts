import { NextRequest } from 'next/server';
import { createScheduleSchema } from '@/validations/schedule';
import { createSchedule, listSchedule, ScheduleError } from '@/modules/scheduling/schedule.service';
import { getDraftBrandId, ApprovalError } from '@/modules/publishing/approval.service';
import { requireAuth, requireBrandAccess, AuthenticationError } from '@/modules/auth/require-auth';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const parsed = createScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten());
  }

  try {
    const user = await requireAuth(req);
    const brandId = await getDraftBrandId(parsed.data.draftId);
    await requireBrandAccess(user, brandId);

    const scheduled = await createSchedule(parsed.data);
    return apiSuccess(scheduled, 201);
  } catch (err) {
    if (err instanceof AuthenticationError) return apiError(err.message, err.status);
    if (err instanceof ApprovalError) return apiError(err.message, err.status);
    if (err instanceof ScheduleError) return apiError(err.message, err.status);
    console.error('Unexpected error in POST /api/posts/schedule:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get('brandId');
  if (!brandId) {
    return apiError('brandId query param is required', 400);
  }

  try {
    const user = await requireAuth(req);
    await requireBrandAccess(user, brandId);

    const items = await listSchedule(brandId);
    return apiSuccess({ items });
  } catch (err) {
    if (err instanceof AuthenticationError) return apiError(err.message, err.status);
    if (err instanceof ScheduleError) return apiError(err.message, err.status);
    console.error('Unexpected error in GET /api/posts/schedule:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
