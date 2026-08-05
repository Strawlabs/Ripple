# Publishing Module — FEATURE-004, FEATURE-005

Content approval state machine (Draft -> Preview -> Approve/Reject/Edit)
and the social publishing engine (LinkedIn + Facebook for MVP).

## Done — Approval Workflow (FEATURE-004)
- `approval.service.ts` — getDraft, editDraft, approveDraft, rejectDraft
- `GET /api/content/drafts/:id` — preview a draft
- `PATCH /api/content/drafts/:id` — edit content fields (only while status = 'draft')
- `POST /api/content/drafts/:id/approve` — approve (blocks re-approval, blocks approving a rejected draft)
- `POST /api/content/drafts/:id/reject` — reject (blocks rejecting an already-approved draft)

## Next steps (checklist Section 8)
- LinkedIn publishing adapter
- Facebook publishing adapter
- Track publish status: Published / Failed (BR-PUB-002)
- Retry logic for failed posts (BR-PUB-003)
- Expired token -> re-auth flow
- IMPORTANT: the publish endpoint MUST check `content_drafts.status === 'approved'`
  before posting anywhere — this is BR-APR-001, the whole reason the
  approval workflow exists.

## Business rules
- BR-APR-001: Nothing can publish without approval — done, enforced by the state machine above
- BR-APR-002: User may request edits before approval — done (PATCH endpoint, only while status='draft')
- BR-PUB-001: Platform account must be connected
- BR-PUB-002: Publishing status must be tracked
- BR-PUB-003: Failed posts must be retriable
