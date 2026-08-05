
## RBAC (added this session)
- `require-auth.ts` — `requireAuth(req)` verifies the caller's Supabase
  access token (Authorization: Bearer <token>) and loads their role.
  `requireRole(user, allowedRoles)` restricts by role.
  `requireBrandAccess(user, brandId)` restricts to the brand's owner,
  or super_admin (platform-wide access).
- **Security fix**: `GET /api/notifications` and `POST /api/content/generate`
  previously trusted a client-supplied `userId`/`brandId` with no
  verification — anyone could read anyone else's notifications or
  generate content on a brand they don't own just by knowing/guessing
  the ID. Both routes now require a real Supabase session token and
  derive identity/ownership from it instead.
- **Still open**: apply `requireAuth`/`requireBrandAccess` to the
  remaining brand-scoped routes (content library, approval workflow,
  scheduling, analytics) — same pattern, not yet done everywhere.
