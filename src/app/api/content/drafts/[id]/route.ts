import { NextRequest } from 'next/server';
import { editDraftSchema } from '@/validations/approval';
import { getDraft, editDraft, ApprovalError } from '@/modules/publishing/approval.service';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const draft = await getDraft(id);
    return apiSuccess(draft);
  } catch (err) {
    if (err instanceof ApprovalError) return apiError(err.message, err.status);
    console.error('Unexpected error in GET /api/content/drafts/[id]:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}

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

  const parsed = editDraftSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten());
  }

  try {
    const draft = await editDraft(id, parsed.data);
    return apiSuccess(draft);
  } catch (err) {
    if (err instanceof ApprovalError) return apiError(err.message, err.status);
    console.error('Unexpected error in PATCH /api/content/drafts/[id]:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
