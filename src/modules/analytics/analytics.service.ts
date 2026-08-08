import { supabaseServer } from '@/lib/supabase-server';
import { createNotification } from '@/modules/notifications/notification.service';

export class AnalyticsError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

interface PublishedPostRow {
  id: string;
  platform: string;
  published_at: string;
  content_drafts: {
    linkedin_content: string | null;
    facebook_content: string | null;
    instagram_content: string | null;
  };
}

interface AnalyticsRow {
  post_id: string;
  reach: number;
  impressions: number;
  engagement: number;
}

/**
 * FEATURE-011 — Analytics Dashboard
 *
 * Aggregation is done in application code rather than SQL because the
 * Supabase JS client doesn't support GROUP BY directly. At MVP scale
 * (a brand's published posts) this is fine; if post volume grows large,
 * move this into a Postgres view or RPC function instead.
 *
 * Metrics: reach, impressions, engagement (from public.analytics).
 * "Followers Growth" from the PRD isn't in the current schema — there's
 * no table tracking follower counts over time yet. Noted as a gap below
 * rather than faked.
 */
export async function getAnalyticsDashboard(brandId: string) {
  // BR from checklist: "Handle missing social connection (warning state)"
  const { data: accounts, error: accountsError } = await supabaseServer
    .from('social_accounts')
    .select('platform, status')
    .eq('brand_id', brandId);

  if (accountsError) throw new AnalyticsError('Could not load social accounts', 500);

  const connectedPlatforms = (accounts ?? [])
    .filter((a) => a.status === 'connected')
    .map((a) => a.platform);

  const { data: posts, error: postsError } = await supabaseServer
    .from('published_posts')
    .select('id, platform, published_at, content_drafts!inner(brand_id, linkedin_content, facebook_content, instagram_content)')
    .eq('content_drafts.brand_id', brandId);

  if (postsError) throw new AnalyticsError('Could not load published posts', 500);

  const publishedPosts = (posts ?? []) as unknown as PublishedPostRow[];

  if (publishedPosts.length === 0) {
    return {
      warning: connectedPlatforms.length === 0 ? 'No social accounts connected yet' : null,
      totals: { reach: 0, impressions: 0, engagement: 0 },
      platformBreakdown: [],
      topPosts: [],
      note: 'No published posts yet — metrics will populate once posts go live.',
    };
  }

  const postIds = publishedPosts.map((p) => p.id);
  const { data: metrics, error: metricsError } = await supabaseServer
    .from('analytics')
    .select('post_id, reach, impressions, engagement')
    .in('post_id', postIds);

  if (metricsError) throw new AnalyticsError('Could not load analytics', 500);

  const metricsByPost = new Map<string, AnalyticsRow>();
  for (const m of (metrics ?? []) as AnalyticsRow[]) {
    metricsByPost.set(m.post_id, m);
  }

  const totals = { reach: 0, impressions: 0, engagement: 0 };
  const platformTotals = new Map<string, { reach: number; impressions: number; engagement: number; posts: number }>();
  const postsWithMetrics: Array<PublishedPostRow & AnalyticsRow> = [];

  for (const post of publishedPosts) {
    const m = metricsByPost.get(post.id) ?? { post_id: post.id, reach: 0, impressions: 0, engagement: 0 };

    totals.reach += m.reach;
    totals.impressions += m.impressions;
    totals.engagement += m.engagement;

    const platformTotal = platformTotals.get(post.platform) ?? {
      reach: 0,
      impressions: 0,
      engagement: 0,
      posts: 0,
    };
    platformTotal.reach += m.reach;
    platformTotal.impressions += m.impressions;
    platformTotal.engagement += m.engagement;
    platformTotal.posts += 1;
    platformTotals.set(post.platform, platformTotal);

    postsWithMetrics.push({ ...post, ...m });
  }

  const captionFor = (p: PublishedPostRow) => {
    const key = `${p.platform}_content` as keyof PublishedPostRow['content_drafts'];
    return p.content_drafts?.[key] ?? null;
  };

  const topPosts = [...postsWithMetrics]
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 5)
    .map((p) => ({
      postId: p.id,
      platform: p.platform,
      publishedAt: p.published_at,
      reach: p.reach,
      impressions: p.impressions,
      engagement: p.engagement,
      caption: captionFor(p),
    }));

  const platformBreakdown = Array.from(platformTotals.entries()).map(([platform, m]) => ({
    platform,
    ...m,
  }));

  return {
    warning: connectedPlatforms.length === 0 ? 'No social accounts connected yet' : null,
    totals,
    platformBreakdown,
    topPosts,
    note: null,
  };
}

/**
 * Weekly Reports — one of the notification types in FEATURE-012.
 *
 * Reuses getAnalyticsDashboard() but filters published_posts to the
 * last 7 days, then sends a 'weekly_report' notification to the brand
 * owner summarizing the numbers. Designed to be called by a weekly cron
 * job (not built yet — see module README) or manually via the API for
 * testing/demo purposes.
 */
export async function generateWeeklyReport(brandId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: brand, error: brandError } = await supabaseServer
    .from('brands')
    .select('id, user_id, company_name')
    .eq('id', brandId)
    .maybeSingle();

  if (brandError) throw new AnalyticsError('Could not load brand', 500);
  if (!brand) throw new AnalyticsError('Brand not found', 404);

  const { data: posts, error: postsError } = await supabaseServer
    .from('published_posts')
    .select('id, platform, published_at, content_drafts!inner(brand_id, linkedin_content, facebook_content, instagram_content)')
    .eq('content_drafts.brand_id', brandId)
    .gte('published_at', sevenDaysAgo);

  if (postsError) throw new AnalyticsError('Could not load published posts', 500);

  const publishedPosts = (posts ?? []) as unknown as PublishedPostRow[];
  const postIds = publishedPosts.map((p) => p.id);

  let totals = { reach: 0, impressions: 0, engagement: 0 };
  if (postIds.length > 0) {
    const { data: metrics, error: metricsError } = await supabaseServer
      .from('analytics')
      .select('reach, impressions, engagement')
      .in('post_id', postIds);

    if (metricsError) throw new AnalyticsError('Could not load analytics', 500);

    for (const m of (metrics ?? []) as AnalyticsRow[]) {
      totals = {
        reach: totals.reach + m.reach,
        impressions: totals.impressions + m.impressions,
        engagement: totals.engagement + m.engagement,
      };
    }
  }

  const report = {
    brandId,
    periodStart: sevenDaysAgo,
    periodEnd: new Date().toISOString(),
    postsPublished: publishedPosts.length,
    totals,
  };

  void createNotification(
    brand.user_id,
    'weekly_report',
    `Weekly report for ${brand.company_name}`,
    `In the last 7 days: ${report.postsPublished} post(s) published, ${totals.reach} reach, ${totals.engagement} engagement.`,
    report
  );

  return report;
}
