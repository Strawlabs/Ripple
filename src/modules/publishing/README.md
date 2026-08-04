# Publishing Module — FEATURE-004, FEATURE-005

Content approval state machine (Draft -> Preview -> Approve/Reject/Edit)
and the social publishing engine (LinkedIn + Facebook for MVP).

## Next steps (checklist Section 7, 8)
- Approval state machine, blocking publish without approval (BR-APR-001)
- LinkedIn publishing adapter
- Facebook publishing adapter
- Track publish status: Published / Failed (BR-PUB-002)
- Retry logic for failed posts (BR-PUB-003)
- Expired token -> re-auth flow

## Business rules
- BR-APR-001: Nothing can publish without approval
- BR-APR-002: User may request edits before approval
- BR-PUB-001: Platform account must be connected
- BR-PUB-002: Publishing status must be tracked
- BR-PUB-003: Failed posts must be retriable
