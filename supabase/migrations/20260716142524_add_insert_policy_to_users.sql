-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile" ON public.users
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
