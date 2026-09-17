-- FEATURE-005 — Social Publishing (X / Twitter)
-- content_drafts already has one column per supported platform
-- (linkedin_content, facebook_content, instagram_content). Adding X
-- as a publishable platform needs a matching column so generated
-- tweets are stored the same way as every other platform's content.

ALTER TABLE public.content_drafts
    ADD COLUMN IF NOT EXISTS twitter_content TEXT;
