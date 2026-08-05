# Analytics Module — FEATURE-011

Reach, impressions, engagement, follower growth metrics pulled from
connected platform APIs and stored in public.analytics.

## Done
- `analytics.service.ts` — getAnalyticsDashboard(brandId): totals,
  per-platform breakdown, top 5 posts by engagement, missing-connection
  warning state
- `GET /api/analytics?brandId=...`

## Known gap (not faked)
- "Followers Growth" is in the PRD metrics list but there's no table
  tracking follower counts over time in the current schema. Needs a
  new table (e.g. `follower_snapshots`) + a periodic job that polls each
  connected platform, once publishing (FEATURE-005) exists.

## Data dependency
This has nothing to aggregate until FEATURE-005 (Publishing) writes
rows to `public.published_posts` and something populates `public.analytics`
per post (either a webhook from each platform or a periodic polling job —
not built yet, decide when Publishing is built). Tested against manually
inserted rows in the meantime — see the SQL used in this session.

## Business rules / behavior
- Handle missing social connection (warning state) — done: returns
  `warning: "No social accounts connected yet"` when no social_accounts
  row has status='connected'
