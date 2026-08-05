import { z } from 'zod';

/**
 * FEATURE-006 — Scheduling Engine
 * BR-SCH-001: Past dates prohibited
 * BR-SCH-002: Timezone awareness required — we require a full ISO 8601
 *   datetime with an explicit offset (e.g. 2026-08-10T14:30:00+05:30),
 *   not a bare "date + time" pair. Postgres stores it as UTC (timestamptz)
 *   regardless, so the offset is only needed at the API boundary to avoid
 *   ambiguity about what "2:30 PM" meant.
 */
const isoWithOffset = z
  .string()
  .refine((val) => {
    // Must be a valid date AND must include a timezone marker (Z or ±HH:MM)
    const hasOffset = /(Z|[+-]\d{2}:\d{2})$/.test(val);
    return hasOffset && !isNaN(Date.parse(val));
  }, 'scheduledAt must be an ISO 8601 datetime with timezone offset, e.g. 2026-08-10T14:30:00+05:30');

export const createScheduleSchema = z.object({
  draftId: z.string().uuid('draftId must be a valid UUID'),
  scheduledAt: isoWithOffset,
});

export const updateScheduleSchema = z.object({
  scheduledAt: isoWithOffset,
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
