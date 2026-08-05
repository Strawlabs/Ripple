import { z } from 'zod';

/**
 * FEATURE-008 — Content Library
 * Query params for GET /api/content/library
 */
export const libraryQuerySchema = z.object({
  brandId: z.string().uuid('brandId must be a valid UUID'),
  status: z.enum(['draft', 'approved', 'rejected']).optional(),
  platform: z.enum(['linkedin', 'facebook', 'instagram']).optional(),
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type LibraryQuery = z.infer<typeof libraryQuerySchema>;
