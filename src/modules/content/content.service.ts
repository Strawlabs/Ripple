import { supabaseServer } from '@/lib/supabase-server';
import { generateText } from './gemini.provider';
import { buildPrompt, Platform, BrandContext } from './prompt-builder';
import type { GenerateContentInput } from '@/validations/content';

export class ContentError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const PLATFORM_COLUMN: Record<Platform, 'linkedin_content' | 'facebook_content' | 'instagram_content'> = {
  linkedin: 'linkedin_content',
  facebook: 'facebook_content',
  instagram: 'instagram_content',
};

/**
 * FEATURE-003 — AI Content Generation
 *
 * Flow:
 *  1. Load the brand (BR-AI-002 requires Brand Memory to influence output).
 *  2. Load brand_memory for that brand (may not exist yet — that's fine,
 *     generation still works, just without extra context).
 *  3. Generate one piece of content per requested platform, each with its
 *     own prompt (BR-AI-001: unique formatting per platform).
 *  4. Save everything as a single row in content_drafts with status
 *     'draft' so it enters the approval workflow (FEATURE-004) and
 *     remains editable (BR-AI-003 — editing happens via a future
 *     PATCH /api/content/drafts/:id endpoint, not built yet).
 */
export async function generateContent(input: GenerateContentInput) {
  const { data: brand, error: brandError } = await supabaseServer
    .from('brands')
    .select('id, company_name, industry, tone')
    .eq('id', input.brandId)
    .maybeSingle();

  if (brandError) {
    throw new ContentError('Could not load brand', 500);
  }
  if (!brand) {
    throw new ContentError('Brand not found', 404);
  }

  const { data: memory } = await supabaseServer
    .from('brand_memory')
    .select('audience, hashtags, rules')
    .eq('brand_id', input.brandId)
    .maybeSingle();

  const brandContext: BrandContext = {
    companyName: brand.company_name,
    industry: brand.industry,
    tone: brand.tone,
    audience: memory?.audience ?? null,
    hashtags: Array.isArray(memory?.hashtags) ? memory.hashtags : [],
    rules: memory?.rules ?? null,
  };

  const results: Partial<Record<Platform, string>> = {};

  for (const platform of input.platforms) {
    const prompt = buildPrompt(platform, input.topic, brandContext);
    try {
      results[platform] = await generateText(prompt);
    } catch (err) {
      throw new ContentError(
        `Generation failed for ${platform}: ${err instanceof Error ? err.message : 'unknown error'}`,
        502
      );
    }
  }

  const row: Record<string, unknown> = {
    brand_id: input.brandId,
    status: 'draft',
  };
  for (const platform of input.platforms) {
    row[PLATFORM_COLUMN[platform]] = results[platform];
  }

  const { data: draft, error: insertError } = await supabaseServer
    .from('content_drafts')
    .insert(row)
    .select()
    .single();

  if (insertError) {
    throw new ContentError('Content generated but could not be saved', 500);
  }

  return draft;
}
