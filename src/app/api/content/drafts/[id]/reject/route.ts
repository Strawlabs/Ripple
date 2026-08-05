import { NextRequest } from 'next/server';
import { rejectDraft, getDraftBrandId, ApprovalError } from '@/modules/publishing/approval.service';
import { requireAuth, requireBrandAccess, AuthenticationError } from '@/modules/auth/require-auth';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await requireAuth(req);
    const brandId = await getDraftBrandId(id);
    await requireBrandAccess(user, brandId);

    const draft = await rejectDraft(id);
    return apiSuccess(draft);
  } catch (err) {
    if (err instanceof AuthenticationError) return apiError(err.message, err.status);
    if (err instanceof ApprovalError) return apiError(err.message, err.status);
    console.error('Unexpected error in POST /api/content/drafts/[id]/reject:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
