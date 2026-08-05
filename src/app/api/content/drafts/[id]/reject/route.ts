import { NextRequest } from 'next/server';
import { rejectDraft, ApprovalError } from '@/modules/publishing/approval.service';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const draft = await rejectDraft(id);
    return apiSuccess(draft);
  } catch (err) {
    if (err instanceof ApprovalError) return apiError(err.message, err.status);
    console.error('Unexpected error in POST /api/content/drafts/[id]/reject:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
