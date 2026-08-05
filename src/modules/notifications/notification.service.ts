import { supabaseServer } from '@/lib/supabase-server';

export class NotificationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type NotificationType =
  | 'approval_required'
  | 'publish_success'
  | 'publish_failure'
  | 'schedule_reminder'
  | 'weekly_report';

/**
 * FEATURE-012 — Notification Center
 *
 * This is a plain insert, deliberately not throwing on failure to the
 * caller's main flow — e.g. if content generation succeeds but the
 * notification insert fails, the draft should still be returned to the
 * user. Callers should call this "fire and forget" style (see
 * content.service.ts) rather than awaiting it as a hard dependency.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata: Record<string, unknown> = {}
) {
  const { error } = await supabaseServer.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    metadata,
  });

  if (error) {
    console.error(`Failed to create '${type}' notification for user ${userId}:`, error.message);
  }
}

export async function listNotifications(userId: string, unreadOnly: boolean) {
  let builder = supabaseServer
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    builder = builder.eq('read', false);
  }

  const { data, error } = await builder;
  if (error) throw new NotificationError('Could not load notifications', 500);
  return data ?? [];
}

export async function markAsRead(id: string) {
  const { data, error } = await supabaseServer
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new NotificationError('Could not update notification', 500);
  return data;
}
