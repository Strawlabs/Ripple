import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export class AuthenticationError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string | undefined;
  role: string;
}

/**
 * FEATURE-001 — Authentication & RBAC
 *
 * Verifies the Supabase access token sent in the Authorization header
 * and loads the caller's role from public.users. This is what every
 * route SHOULD use to identify who is calling, instead of trusting an
 * unauthenticated `userId`/`brandId` query param (which any caller
 * could set to someone else's ID and read their data).
 *
 * Usage in a route:
 *   const user = await requireAuth(req);
 *   // user.id is now the REAL caller, not something client-supplied
 */
export async function requireAuth(req: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid Authorization header. Expected: Bearer <token>');
  }

  const token = authHeader.slice('Bearer '.length);
  const { data, error } = await supabaseServer.auth.getUser(token);

  if (error || !data.user) {
    throw new AuthenticationError('Invalid or expired session token');
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new AuthenticationError('User profile not found', 404);
  }

  return { id: data.user.id, email: data.user.email, role: profile.role };
}

const ROLE_HIERARCHY = ['team_member', 'business_user', 'agency_user', 'super_admin'];

/**
 * Throws if the authenticated user's role isn't in the allowed list.
 * Roles are checked by exact membership, not hierarchy — pass every
 * role that should be allowed for a given route.
 */
export function requireRole(user: AuthenticatedUser, allowedRoles: string[]) {
  if (!ROLE_HIERARCHY.includes(user.role)) {
    throw new AuthenticationError(`Unknown role '${user.role}'`, 403);
  }
  if (!allowedRoles.includes(user.role)) {
    throw new AuthenticationError(
      `This action requires one of: ${allowedRoles.join(', ')}. Your role: ${user.role}`,
      403
    );
  }
}

/**
 * Ensures the authenticated user owns the given brand, or is a
 * super_admin (who can act on any brand — platform-level oversight).
 * This is what stops one business from generating/reading content on
 * a brand that isn't theirs, even if they know or guess the brandId.
 */
export async function requireBrandAccess(user: AuthenticatedUser, brandId: string) {
  if (user.role === 'super_admin') return;

  const { data: brand, error } = await supabaseServer
    .from('brands')
    .select('user_id')
    .eq('id', brandId)
    .maybeSingle();

  if (error) throw new AuthenticationError('Could not verify brand ownership', 500);
  if (!brand) throw new AuthenticationError('Brand not found', 404);
  if (brand.user_id !== user.id) {
    throw new AuthenticationError('You do not have access to this brand', 403);
  }
}
