# Scheduling Module — FEATURE-006

Future publishing via BullMQ job queue.

## Done — CRUD + business rules
- `schedule.service.ts` — createSchedule, listSchedule, rescheduleSchedule, cancelSchedule
- `POST /api/posts/schedule` — schedule an approved draft (rejects non-approved drafts, rejects past dates)
- `GET /api/posts/schedule?brandId=...` — list scheduled posts for a brand, joined with draft content
- `PATCH /api/posts/schedule/:id` — reschedule (only while status='pending')
- `DELETE /api/posts/schedule/:id` — cancel (only while status='pending')

## Deliberately NOT done yet
- The actual BullMQ worker that fires at `scheduled_at` and calls the
  publishing adapter. There's nothing to call yet — FEATURE-005
  (LinkedIn/Facebook publishing) is blocked on API access. Build the
  worker once that adapter exists; the CRUD/business-rule layer above
  won't need to change.

## Business rules
- BR-SCH-001: Past dates prohibited — done (assertFutureDate)
- BR-SCH-002: Timezone awareness required — done (ISO 8601 with explicit offset required at the API boundary)
- BR-SCH-003: Scheduled posts editable — done (PATCH, only while pending)

## Done — Auto-publish worker (added this session)
- `process-due-posts.ts` — processDuePosts(): finds scheduled_posts
  where status='pending' and scheduled_at has passed, attempts to
  publish every platform the draft has content for (reuses
  publishToLinkedIn/publishToFacebook as-is — same tested code path
  as manual "Publish Now"), marks 'completed' if anything succeeded
  or 'failed' otherwise
- `POST /api/cron/process-scheduled` — trigger endpoint, protected by
  CRON_SECRET (Bearer token) if set. Meant to be called by a real cron
  job (e.g. Vercel Cron) every few minutes in production; can also be
  triggered manually via curl for testing/demo
- NOT set up as an actual recurring cron job yet — that's a deployment
  config step (Section 15), not application code. Someone needs to add
  a `vercel.json` cron entry (or equivalent) once this is deployed.
