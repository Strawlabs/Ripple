import { z } from 'zod';

/**
 * FEATURE-004 — Content Approval Workflow
 * Workflow: Generate -> Preview -> Approve/Reject/Edit -> Publish
 */

export const draftStatusValues = ['draft', 'approved', 'rejected'] as const;
export type DraftStatus = (typeof draftStatusValues)[number];

// BR-APR-002: User may request edits before approval. Only content fields
// are editable — status changes go through the approve/reject endpoints
// so the workflow stays explicit and auditable.
export const editDraftSchema = z
  .object({
    linkedinContent: z.string().trim().min(1).optional(),
    facebookContent: z.string().trim().min(1).optional(),
    instagramContent: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: 'Provide at least one field to update' }
  );

export type EditDraftInput = z.infer<typeof editDraftSchema>;
