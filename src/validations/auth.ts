import { z } from 'zod';

/**
 * FEATURE-001 — Authentication & User Management
 * Business Rules enforced here:
 *  - BR-AUTH-001: Email must be unique (DB-level UNIQUE constraint backs this up)
 *  - BR-AUTH-002: WhatsApp number must be unique
 *  - BR-AUTH-003: One WhatsApp number can belong to only one Ripple account
 */

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid WhatsApp number in E.164 format')
    .optional(),
  role: z
    .enum(['super_admin', 'business_user', 'agency_user', 'team_member'])
    .default('business_user'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
