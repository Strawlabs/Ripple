# Notifications Module — FEATURE-012

## Done
- `notification.service.ts` — createNotification (fire-and-forget),
  listNotifications, markAsRead
- `GET /api/notifications?userId=...&unreadOnly=true`
- `PATCH /api/notifications/:id/read`
- Migration: `supabase/migrations/20260805153000_add_notifications_table.sql`
- Wired triggers:
  - `approval_required` — fires automatically when content.service.ts generates a draft
  - `weekly_report` — fires when analytics.service.ts generateWeeklyReport() runs (see GET /api/analytics/weekly-report)

## Not wired yet (needs the feature that would trigger them)
- `publish_success` / `publish_failure` — needs FEATURE-005 (Publishing) to exist first
- `schedule_reminder` — done (this session): `send-reminders.ts` +
  `POST /api/cron/send-reminders`, fires ~15 min before scheduled_at,
  uses the notifications table itself to avoid double-sending

## Weekly Report automation
`GET /api/analytics/weekly-report?brandId=...` computes the last 7 days
and sends a `weekly_report` notification. Currently manually triggered
(good for testing/demo). For production, wire this to a weekly cron job
(e.g. a Vercel Cron Job hitting this endpoint for every brand) once
deployment infra (checklist Section 15) is set up.
