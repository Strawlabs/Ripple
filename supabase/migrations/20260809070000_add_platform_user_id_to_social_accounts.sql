-- FEATURE-005 — Social Publishing
-- The LinkedIn/Facebook OAuth callbacks and the publishing services
-- need to store the platform's own user/page id (e.g. LinkedIn's
-- "urn:li:person:{id}" author field, or a Facebook Page id) alongside
-- the access token, to know who to post as. This column was
-- referenced in application code without ever being added to the
-- schema — this migration fixes that gap.

ALTER TABLE public.social_accounts
    ADD COLUMN IF NOT EXISTS platform_user_id TEXT;
