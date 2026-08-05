import { supabaseServer } from '@/lib/supabase-server';
import type { EditDraftInput } from '@/validations/approval';

export class ApprovalError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

async function getDraftOrThrow(id: string) {
  const { data, error } = await supabaseServer
    .from('content_drafts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new ApprovalError('Could not load draft', 500);
  if (!data) throw new ApprovalError('Draft not found', 404);
  return data;
}

export async function getDraft(id: string) {
  return getDraftOrThrow(id);
}

/**
 * BR-APR-002: User may request edits before approval.
 * Editing is only allowed while status is 'draft' — once approved or
 * rejected, the record is final; regenerate a new draft instead.
 */
export async function editDraft(id: string, input: EditDraftInput) {
  const draft = await getDraftOrThrow(id);

  if (draft.status !== 'draft') {
    throw new ApprovalError(
      `Cannot edit a draft with status '${draft.status}'. Only drafts pending approval can be edited.`,
      409
    );
  }

  const update: Record<string, string> = {};
  if (input.linkedinContent !== undefined) update.linkedin_content = input.linkedinContent;
  if (input.facebookContent !== undefined) update.facebook_content = input.facebookContent;
  if (input.instagramContent !== undefined) update.instagram_content = input.instagramContent;

  const { data, error } = await supabaseServer
    .from('content_drafts')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ApprovalError('Could not save edits', 500);
  return data;
}

/**
 * BR-APR-001: Nothing can publish without approval.
 * This endpoint is what flips a draft to 'approved' — the publishing
 * module (FEATURE-005) must check for this status before posting
 * anywhere, so approval is a hard gate rather than a suggestion.
 */
export async function approveDraft(id: string) {
  const draft = await getDraftOrThrow(id);

  if (draft.status === 'approved') {
    throw new ApprovalError('Draft is already approved', 409);
  }
  if (draft.status === 'rejected') {
    throw new ApprovalError('Cannot approve a rejected draft. Generate a new one instead.', 409);
  }

  const { data, error } = await supabaseServer
    .from('content_drafts')
    .update({ status: 'approved' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ApprovalError('Could not approve draft', 500);
  return data;
}

export async function rejectDraft(id: string) {
  const draft = await getDraftOrThrow(id);

  if (draft.status === 'approved') {
    throw new ApprovalError('Cannot reject an already-approved draft', 409);
  }

  const { data, error } = await supabaseServer
    .from('content_drafts')
    .update({ status: 'rejected' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ApprovalError('Could not reject draft', 500);
  return data;
}
