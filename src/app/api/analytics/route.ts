import { NextRequest } from 'next/server';
import { getAnalyticsDashboard, AnalyticsError } from '@/modules/analytics/analytics.service';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get('brandId');
  if (!brandId) {
    return apiError('brandId query param is required', 400);
  }

  try {
    const dashboard = await getAnalyticsDashboard(brandId);
    return apiSuccess(dashboard);
  } catch (err) {
    if (err instanceof AnalyticsError) return apiError(err.message, err.status);
    console.error('Unexpected error in GET /api/analytics:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
