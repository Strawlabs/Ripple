import { supabaseServer } from '@/lib/supabase-server';
import type { RegisterInput } from '@/validations/auth';

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Registers a new Ripple user.
 *
 * Flow:
 *  1. Create the auth identity in Supabase Auth.
 *  2. Enforce BR-AUTH-002 / BR-AUTH-003: WhatsApp number must be unique
 *     and belong to exactly one account (checked here since Supabase
 *     Auth itself doesn't know about our `whatsapp` column).
 *  3. Insert the corresponding row into public.users.
 *
 * BR-AUTH-001 (unique email) is enforced by Supabase Auth itself plus the
 * UNIQUE constraint on public.users.email.
 */
export async function registerUser(input: RegisterInput) {
  if (input.whatsapp) {
    const { data: existing, error: lookupError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('whatsapp', input.whatsapp)
      .maybeSingle();

    if (lookupError) {
      throw new AuthError('Could not verify WhatsApp number uniqueness', 500);
    }
    if (existing) {
      throw new AuthError('This WhatsApp number is already linked to a Ripple account', 409);
    }
  }

  const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    // Supabase returns a generic conflict error for duplicate emails (BR-AUTH-001).
    throw new AuthError(authError?.message ?? 'Registration failed', 409);
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from('users')
    .insert({
      id: authData.user.id,
      name: input.name,
      email: input.email,
      whatsapp: input.whatsapp ?? null,
      role: input.role,
    })
    .select()
    .single();

  if (profileError) {
    // Roll back the auth user so we don't leave an orphaned identity.
    await supabaseServer.auth.admin.deleteUser(authData.user.id);
    throw new AuthError('Could not create user profile', 500);
  }

  return profile;
}
