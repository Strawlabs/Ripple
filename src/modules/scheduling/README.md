# Scheduling Module — FEATURE-006

Future publishing via BullMQ job queue.

## Next steps (checklist Section 9)
- BullMQ job creation on schedule (uses ioredis, already added to package.json)
- Reject past dates (BR-SCH-001)
- Timezone validation (BR-SCH-002)
- Editable/cancelable scheduled posts (BR-SCH-003)

## Business rules
- BR-SCH-001: Past dates prohibited
- BR-SCH-002: Timezone awareness required
- BR-SCH-003: Scheduled posts editable
