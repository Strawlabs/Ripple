import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the Service Role key.
 *
 * IMPORTANT: Only import this in server-side code (API routes, server
 * actions). Never expose SUPABASE_SERVICE_ROLE_KEY to the client bundle.
 *
 * Use this for:
 *  - WhatsApp webhook handlers (no user session available)
 *  - Admin operations that must bypass Row Level Security
 *  - Scheduled jobs / queue workers
 *
 * For anything running in the browser or within a user's authenticated
 * session, keep using `src/lib/supabase.ts` (anon key) so RLS policies
 * apply normally.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
