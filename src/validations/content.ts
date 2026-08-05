import { z } from 'zod';

export const generateContentSchema = z.object({
  brandId: z.string().uuid('brandId must be a valid UUID'),
  topic: z.string().trim().min(3, 'Topic must be at least 3 characters'),
  platforms: z
    .array(z.enum(['linkedin', 'facebook', 'instagram']))
    .min(1, 'Select at least one platform'),
});

export type GenerateContentInput = z.infer<typeof generateContentSchema>;
