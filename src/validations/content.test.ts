import { describe, it, expect } from 'vitest';
import { generateContentSchema } from './content';
import { editDraftSchema } from './approval';
import { libraryQuerySchema } from './library';

describe('generateContentSchema', () => {
  it('accepts a valid request', () => {
    const result = generateContentSchema.safeParse({
      brandId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab',
      topic: 'New product launch',
      platforms: ['linkedin', 'facebook'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty platforms array', () => {
    const result = generateContentSchema.safeParse({
      brandId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab',
      topic: 'New product launch',
      platforms: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unsupported platform', () => {
    const result = generateContentSchema.safeParse({
      brandId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab',
      topic: 'New product launch',
      platforms: ['twitter'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a topic under 3 characters', () => {
    const result = generateContentSchema.safeParse({
      brandId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab',
      topic: 'hi',
      platforms: ['linkedin'],
    });
    expect(result.success).toBe(false);
  });
});

describe('editDraftSchema — BR-APR-002 (edit before approval)', () => {
  it('accepts an update to a single platform field', () => {
    expect(editDraftSchema.safeParse({ linkedinContent: 'Updated text' }).success).toBe(true);
  });

  it('rejects an empty payload (must update at least one field)', () => {
    expect(editDraftSchema.safeParse({}).success).toBe(false);
  });

  it('rejects an empty string as content', () => {
    expect(editDraftSchema.safeParse({ linkedinContent: '' }).success).toBe(false);
  });
});

describe('libraryQuerySchema', () => {
  it('applies default limit/offset when omitted', () => {
    const result = libraryQuerySchema.parse({ brandId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab' });
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  it('rejects a limit above 100', () => {
    const result = libraryQuerySchema.safeParse({
      brandId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab',
      limit: '500',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid status value', () => {
    const result = libraryQuerySchema.safeParse({
      brandId: 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab',
      status: 'published', // not a real content_drafts status
    });
    expect(result.success).toBe(false);
  });
});
