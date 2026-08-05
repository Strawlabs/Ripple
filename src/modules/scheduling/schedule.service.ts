import { supabaseServer } from '@/lib/supabase-server';
import type { CreateScheduleInput, UpdateScheduleInput } from '@/validations/schedule';

export class ScheduleError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function assertFutureDate(scheduledAt: string) {
  // BR-SCH-001: Past dates prohibited.
  if (new Date(scheduledAt).getTime() <= Date.now()) {
    throw new ScheduleError('scheduledAt must be in the future', 422);
  }
}

/**
 * FEATURE-006 — Scheduling Engine
 *
 * A draft must be 'approved' before it can be scheduled — this keeps
 * BR-APR-001 (nothing publishes without approval) intact even though
 * scheduling isn't publishing itself, it's the step right before it.
 *
 * NOTE: this creates the scheduled_posts row and validates timing/status.
 * The actual "fire a job at scheduled_at and call the publishing adapter"
 * worker (BullMQ) is intentionally not wired yet — there's no LinkedIn/
 * Facebook publishing adapter to call (FEATURE-005, blocked on API
 * access). Once that adapter exists, a worker reads due rows from this
 * table and calls it; the CRUD here doesn't change.
 */
export async function createSchedule(input: CreateScheduleInput) {
  assertFutureDate(input.scheduledAt);

  const { data: draft, error: draftError } = await supabaseServer
    .from('content_drafts')
    .select('id, brand_id, status')
    .eq('id', input.draftId)
    .maybeSingle();

  if (draftError) throw new ScheduleError('Could not load draft', 500);
  if (!draft) throw new ScheduleError('Draft not found', 404);
  if (draft.status !== 'approved') {
    throw new ScheduleError(
      `Cannot schedule a draft with status '${draft.status}'. Only approved drafts can be scheduled.`,
      409
    );
  }

  const { data, error } = await supabaseServer
    .from('scheduled_posts')
    .insert({
      draft_id: input.draftId,
      scheduled_at: input.scheduledAt,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new ScheduleError('Could not create scheduled post', 500);
  return data;
}

export async function listSchedule(brandId: string) {
  const { data, error } = await supabaseServer
    .from('scheduled_posts')
    .select('*, content_drafts!inner(brand_id, linkedin_content, facebook_content, instagram_content, status)')
    .eq('content_drafts.brand_id', brandId)
    .order('scheduled_at', { ascending: true });

  if (error) throw new ScheduleError('Could not load scheduled posts', 500);
  return data ?? [];
}

/**
 * BR-SCH-003: Scheduled posts editable. Only the time can be changed here
 * (rescheduling) — to change content, edit the draft itself before it's
 * approved.
 */
export async function rescheduleSchedule(id: string, input: UpdateScheduleInput) {
  assertFutureDate(input.scheduledAt);

  const { data: existing, error: lookupError } = await supabaseServer
    .from('scheduled_posts')
    .select('id, status')
    .eq('id', id)
    .maybeSingle();

  if (lookupError) throw new ScheduleError('Could not load scheduled post', 500);
  if (!existing) throw new ScheduleError('Scheduled post not found', 404);
  if (existing.status !== 'pending') {
    throw new ScheduleError(
      `Cannot reschedule a post with status '${existing.status}'.`,
      409
    );
  }

  const { data, error } = await supabaseServer
    .from('scheduled_posts')
    .update({ scheduled_at: input.scheduledAt })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ScheduleError('Could not reschedule post', 500);
  return data;
}

export async function cancelSchedule(id: string) {
  const { data: existing, error: lookupError } = await supabaseServer
    .from('scheduled_posts')
    .select('id, status')
    .eq('id', id)
    .maybeSingle();

  if (lookupError) throw new ScheduleError('Could not load scheduled post', 500);
  if (!existing) throw new ScheduleError('Scheduled post not found', 404);
  if (existing.status !== 'pending') {
    throw new ScheduleError(`Cannot cancel a post with status '${existing.status}'.`, 409);
  }

  const { data, error } = await supabaseServer
    .from('scheduled_posts')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ScheduleError('Could not cancel scheduled post', 500);
  return data;
}
