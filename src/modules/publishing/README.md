# Publishing Module — FEATURE-004, FEATURE-005

Content approval state machine (Draft -> Preview -> Approve/Reject/Edit)
and the social publishing engine (LinkedIn + Facebook for MVP).

## Done — Approval Workflow (FEATURE-004)
- `approval.service.ts` — getDraft, editDraft, approveDraft, rejectDraft
- `GET /api/content/drafts/:id`, `PATCH`, `POST /approve`, `POST /reject`

## Done — Publishing (FEATURE-005)
- `linkedin-publish.service.ts` — publishToLinkedIn(), tested live (real post confirmed on LinkedIn)
- `facebook-publish.service.ts` — publishToFacebook(), same pattern as LinkedIn (posts to a Page via /feed, not a personal profile)
- `POST /api/content/drafts/:id/publish` with `{ platform: 'linkedin' | 'facebook' }` in the body — dispatches to the right service
- Both: BR-APR-001 gate (must be 'approved'), insert into `published_posts` on success (this is what Analytics/Dashboard read), fire `publish_success`/`publish_failure` notifications
- Content Library's Publish Now button hides itself for Instagram cards (no adapter for that platform — not in MVP scope per PRD)

## Next steps
- Retry logic beyond "click Publish Now again" (BR-PUB-003) — currently manual retry via the same button, no automated retry/backoff
- Expired token -> re-auth flow: Facebook's 401/code-190 case is detected and message says "reconnect", but there's no in-app prompt/redirect yet, just the error text
- Instagram publishing adapter (Phase 2 per PRD — not MVP scope)

## Business rules
- BR-APR-001: Nothing can publish without approval — done
- BR-APR-002: User may request edits before approval — done
- BR-PUB-001: Platform account must be connected — done (checked before every publish attempt)
- BR-PUB-002: Publishing status must be tracked — done (content_drafts.status + published_posts row)
- BR-PUB-003: Failed posts must be retriable — partial (can re-click Publish Now; no automated retry queue)
