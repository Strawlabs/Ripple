import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from './auth';

describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      whatsapp: '+919876543210',
    });
    expect(result.success).toBe(true);
  });

  it('defaults role to business_user when omitted', () => {
    const result = registerSchema.parse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.role).toBe('business_user');
  });

  it('rejects an invalid email (supports BR-AUTH-001 at the input layer)', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: '123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a WhatsApp number without a valid E.164-ish format', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      whatsapp: 'not-a-number',
    });
    expect(result.success).toBe(false);
  });

  it('allows registration without a WhatsApp number (optional field)', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown role', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'super_hacker',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'test@example.com', password: 'x' }).success).toBe(true);
  });

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'test@example.com', password: '' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
  });
});
