import type { Platform } from '@/modules/content/prompt-builder';

export interface ContentRequest {
  platform: Platform;
  topic: string;
}

const PLATFORM_WORDS: Record<string, Platform> = {
  linkedin: 'linkedin',
  facebook: 'facebook',
  instagram: 'instagram',
};

/**
 * Matches the PRD's example inputs, e.g.:
 *   "Create a LinkedIn post about AI."
 *   "Write a Facebook post about our new feature"
 *
 * This is intentionally simple pattern matching, not NLP — good enough
 * for the common "create a <platform> post about <topic>" phrasing.
 * Messages that don't match just get acknowledged and stored as a
 * regular conversation entry instead of triggering generation.
 */
export function detectContentRequest(text: string): ContentRequest | null {
  const platformMatch = Object.keys(PLATFORM_WORDS).find((word) =>
    new RegExp(`\\b${word}\\b`, 'i').test(text)
  );
  if (!platformMatch) return null;

  const topicMatch = text.match(/(?:about|on|regarding)\s+(.+)/i);
  if (!topicMatch) return null;

  const topic = topicMatch[1].replace(/[.!?]+$/, '').trim();
  if (topic.length < 3) return null;

  return { platform: PLATFORM_WORDS[platformMatch], topic };
}
