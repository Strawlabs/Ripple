import { describe, it, expect } from 'vitest';
import { requireRole, AuthenticationError, AuthenticatedUser } from './require-auth';

function user(role: string): AuthenticatedUser {
  return { id: 'u1', email: 'u@example.com', role };
}

describe('requireRole', () => {
  it('allows a user whose role is in the allowed list', () => {
    expect(() => requireRole(user('business_user'), ['business_user', 'agency_user'])).not.toThrow();
  });

  it('rejects a user whose role is not in the allowed list', () => {
    expect(() => requireRole(user('team_member'), ['super_admin'])).toThrow(AuthenticationError);
  });

  it('rejects an unrecognized role even if it happens to be in the allowed list', () => {
    // Defends against a bad/legacy role value slipping through — being
    // in the allowed list isn't enough if it's not a real role at all.
    expect(() => requireRole(user('made_up_role'), ['made_up_role'])).toThrow(AuthenticationError);
  });

  it('error message names the roles that would have been accepted', () => {
    try {
      requireRole(user('team_member'), ['super_admin', 'agency_user']);
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(AuthenticationError);
      expect((err as AuthenticationError).message).toContain('super_admin');
      expect((err as AuthenticationError).message).toContain('agency_user');
    }
  });

  it('uses a 403 status for role failures', () => {
    try {
      requireRole(user('team_member'), ['super_admin']);
      expect.unreachable('should have thrown');
    } catch (err) {
      expect((err as AuthenticationError).status).toBe(403);
    }
  });
});
