import { supabaseServer } from '@/lib/supabase-server';
import type { LibraryQuery } from '@/validations/library';

export class LibraryError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const PLATFORM_COLUMN: Record<string, string> = {
  linkedin: 'linkedin_content',
  facebook: 'facebook_content',
  instagram: 'instagram_content',
};

/**
 * FEATURE-008 — Content Library
 *
 * Lists content_drafts for a brand with optional filters:
 *  - status: draft / approved / rejected
 *  - platform: only rows that actually have content for that platform
 *  - search: keyword match across all three content columns
 *
 * Note: this covers Drafts, Scheduled, and Published *conceptually*
 * (status covers draft/approved; a 'published' status will be added once
 * FEATURE-005 Publishing writes to published_posts and updates this
 * table). For now this is the draft/approval side of the library.
 */
export async function listContent(query: LibraryQuery) {
  let builder = supabaseServer
    .from('content_drafts')
    .select('*', { count: 'exact' })
    .eq('brand_id', query.brandId)
    .order('created_at', { ascending: false })
    .range(query.offset, query.offset + query.limit - 1);

  if (query.status) {
    builder = builder.eq('status', query.status);
  }

  if (query.platform) {
    builder = builder.not(PLATFORM_COLUMN[query.platform], 'is', null);
  }

  if (query.search) {
    const term = `%${query.search}%`;
    builder = builder.or(
      `linkedin_content.ilike.${term},facebook_content.ilike.${term},instagram_content.ilike.${term}`
    );
  }

  const { data, error, count } = await builder;

  if (error) {
    throw new LibraryError('Could not load content library', 500);
  }

  return {
    items: data ?? [],
    total: count ?? 0,
    limit: query.limit,
    offset: query.offset,
  };
}
