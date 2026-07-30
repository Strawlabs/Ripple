-- Enable Row Level Security and Create tables

-- 1. users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. brands
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    tone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 3. brand_memory
CREATE TABLE IF NOT EXISTS public.brand_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    audience TEXT,
    hashtags JSONB DEFAULT '[]'::jsonb,
    rules TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for brand_memory
ALTER TABLE public.brand_memory ENABLE ROW LEVEL SECURITY;

-- 4. social_accounts
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for social_accounts
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- 5. conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    whatsapp_number TEXT,
    message_type TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 6. content_drafts
CREATE TABLE IF NOT EXISTS public.content_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    source_message_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    linkedin_content TEXT,
    facebook_content TEXT,
    instagram_content TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for content_drafts
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;

-- 7. published_posts
CREATE TABLE IF NOT EXISTS public.published_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES public.content_drafts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    external_post_id TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for published_posts
ALTER TABLE public.published_posts ENABLE ROW LEVEL SECURITY;

-- 8. scheduled_posts
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES public.content_drafts(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for scheduled_posts
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- 9. analytics
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.published_posts(id) ON DELETE CASCADE,
    reach INTEGER DEFAULT 0 NOT NULL,
    impressions INTEGER DEFAULT 0 NOT NULL,
    engagement INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for analytics
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;


-- Basic Policies
-- 1. users
CREATE POLICY "Allow users to select their own profile" ON public.users
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. brands
CREATE POLICY "Allow users to select their own brands" ON public.brands
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own brands" ON public.brands
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own brands" ON public.brands
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own brands" ON public.brands
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. brand_memory
CREATE POLICY "Allow users to select their own brand memories" ON public.brand_memory
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = brand_memory.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to insert their own brand memories" ON public.brand_memory
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = brand_memory.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to update their own brand memories" ON public.brand_memory
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = brand_memory.brand_id AND brands.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = brand_memory.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to delete their own brand memories" ON public.brand_memory
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = brand_memory.brand_id AND brands.user_id = auth.uid()
        )
    );

-- 4. social_accounts
CREATE POLICY "Allow users to select their own social accounts" ON public.social_accounts
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = social_accounts.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to insert their own social accounts" ON public.social_accounts
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = social_accounts.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to update their own social accounts" ON public.social_accounts
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = social_accounts.brand_id AND brands.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = social_accounts.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to delete their own social accounts" ON public.social_accounts
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = social_accounts.brand_id AND brands.user_id = auth.uid()
        )
    );

-- 5. conversations
CREATE POLICY "Allow users to select their own conversations" ON public.conversations
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = conversations.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to insert their own conversations" ON public.conversations
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = conversations.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to update their own conversations" ON public.conversations
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = conversations.brand_id AND brands.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = conversations.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to delete their own conversations" ON public.conversations
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = conversations.brand_id AND brands.user_id = auth.uid()
        )
    );

-- 6. content_drafts
CREATE POLICY "Allow users to select their own drafts" ON public.content_drafts
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = content_drafts.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to insert their own drafts" ON public.content_drafts
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = content_drafts.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to update their own drafts" ON public.content_drafts
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = content_drafts.brand_id AND brands.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = content_drafts.brand_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to delete their own drafts" ON public.content_drafts
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = content_drafts.brand_id AND brands.user_id = auth.uid()
        )
    );

-- 7. published_posts
CREATE POLICY "Allow users to select their own published posts" ON public.published_posts
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.content_drafts
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE content_drafts.id = published_posts.draft_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to insert their own published posts" ON public.published_posts
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.content_drafts
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE content_drafts.id = published_posts.draft_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to update their own published posts" ON public.published_posts
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.content_drafts
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE content_drafts.id = published_posts.draft_id AND brands.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.content_drafts
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE content_drafts.id = published_posts.draft_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to delete their own published posts" ON public.published_posts
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.content_drafts
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE content_drafts.id = published_posts.draft_id AND brands.user_id = auth.uid()
        )
    );

-- 8. scheduled_posts
CREATE POLICY "Allow users to select their own scheduled posts" ON public.scheduled_posts
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.content_drafts
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE content_drafts.id = scheduled_posts.draft_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to insert their own scheduled posts" ON public.scheduled_posts
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.content_drafts
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE content_drafts.id = scheduled_posts.draft_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to update their own scheduled posts" ON public.scheduled_posts
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.content_drafts
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE content_drafts.id = scheduled_posts.draft_id AND brands.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.content_drafts
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE content_drafts.id = scheduled_posts.draft_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to delete their own scheduled posts" ON public.scheduled_posts
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.content_drafts
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE content_drafts.id = scheduled_posts.draft_id AND brands.user_id = auth.uid()
        )
    );

-- 9. analytics
CREATE POLICY "Allow users to select their own analytics" ON public.analytics
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.published_posts
            JOIN public.content_drafts ON content_drafts.id = published_posts.draft_id
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE published_posts.id = analytics.post_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to insert their own analytics" ON public.analytics
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.published_posts
            JOIN public.content_drafts ON content_drafts.id = published_posts.draft_id
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE published_posts.id = analytics.post_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to update their own analytics" ON public.analytics
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.published_posts
            JOIN public.content_drafts ON content_drafts.id = published_posts.draft_id
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE published_posts.id = analytics.post_id AND brands.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.published_posts
            JOIN public.content_drafts ON content_drafts.id = published_posts.draft_id
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE published_posts.id = analytics.post_id AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to delete their own analytics" ON public.analytics
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.published_posts
            JOIN public.content_drafts ON content_drafts.id = published_posts.draft_id
            JOIN public.brands ON brands.id = content_drafts.brand_id
            WHERE published_posts.id = analytics.post_id AND brands.user_id = auth.uid()
        )
    );
