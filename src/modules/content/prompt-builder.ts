export type Platform = 'linkedin' | 'facebook' | 'instagram';

export interface BrandContext {
  companyName: string;
  industry?: string | null;
  website?: string | null;
  tone?: string | null;
  audience?: string | null;
  hashtags?: string[];
  rules?: string | null;
}

/**
 * FEATURE-003 — Prompt Builder
 *
 * BR-AI-001: Each platform receives unique formatting.
 * BR-AI-002: Brand Memory must influence generated content.
 *
 * Prompts are versioned by PROMPT_VERSION (checklist Rule 7: "Version
 * control AI prompts"). Bump this when the prompt text changes so
 * generated content can be traced back to the template that produced it.
 */
export const PROMPT_VERSION = 'v1';

const PLATFORM_GUIDELINES: Record<Platform, string> = {
  linkedin:
    'Write for LinkedIn: professional tone, 3-5 short paragraphs, no more ' +
    'than 3 relevant hashtags at the end, encourage discussion, avoid emojis unless the brand tone calls for them.',
  facebook:
    'Write for Facebook: warm and conversational tone, 2-3 short paragraphs, ' +
    'can include 1-2 emojis if it fits the brand tone, end with a light call-to-action.',
  instagram:
    'Write for Instagram: punchy and visual caption, short lines, emojis welcome, ' +
    '5-10 relevant hashtags grouped at the end.',
};

export function buildPrompt(
  platform: Platform,
  topic: string,
  brand: BrandContext
): string {
  const brandLines = [
    `Company: ${brand.companyName}`,
    brand.industry ? `Industry: ${brand.industry}` : null,
    brand.tone ? `Preferred tone: ${brand.tone}` : null,
    brand.audience ? `Target audience: ${brand.audience}` : null,
    brand.hashtags?.length ? `Preferred hashtags: ${brand.hashtags.join(', ')}` : null,
    brand.rules ? `Content rules to strictly follow: ${brand.rules}` : null,
  ].filter(Boolean);

  return [
    `You are Ripple, an AI marketing manager writing a social media post.`,
    ``,
    `Brand context (must influence tone, vocabulary, and hashtags used):`,
    ...brandLines,
    ``,
    `Platform: ${platform}`,
    PLATFORM_GUIDELINES[platform],
    ``,
    `Topic to write about: ${topic}`,
    ``,
    `Return only the post content. No explanations, no markdown formatting, no quotation marks around the text.`,
  ].join('\n');
}
