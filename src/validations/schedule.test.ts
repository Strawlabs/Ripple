import { describe, it, expect } from 'vitest';
import { createScheduleSchema, updateScheduleSchema } from './schedule';

describe('createScheduleSchema — BR-SCH-002 (timezone awareness)', () => {
  it('accepts an ISO datetime with a positive UTC offset', () => {
    const result = createScheduleSchema.safeParse({
      draftId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab',
      scheduledAt: '2027-01-01T10:00:00+05:30',
    });
    expect(result.success).toBe(true);
  });

  it('accepts an ISO datetime with a Z (UTC) suffix', () => {
    const result = createScheduleSchema.safeParse({
      draftId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab',
      scheduledAt: '2027-01-01T10:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a datetime with no timezone marker at all', () => {
    const result = createScheduleSchema.safeParse({
      draftId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab',
      scheduledAt: '2027-01-01T10:00:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a garbage date string', () => {
    const result = createScheduleSchema.safeParse({
      draftId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab',
      scheduledAt: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-UUID draftId', () => {
    const result = createScheduleSchema.safeParse({
      draftId: 'not-a-uuid',
      scheduledAt: '2027-01-01T10:00:00Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateScheduleSchema', () => {
  it('accepts a valid reschedule payload', () => {
    expect(updateScheduleSchema.safeParse({ scheduledAt: '2027-06-01T09:00:00-04:00' }).success).toBe(true);
  });
});

// BR-SCH-001 (past dates prohibited) is enforced at runtime in
// schedule.service.ts's assertFutureDate(), not at the schema layer,
// since "future" depends on the current time when the request is made
// rather than the shape of the string. That's covered by the manual
// end-to-end test in this session (schedule-past.json returning
// "scheduledAt must be in the future") rather than a unit test here.
