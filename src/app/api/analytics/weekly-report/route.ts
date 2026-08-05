import { NextRequest } from 'next/server';
import { generateWeeklyReport, AnalyticsError } from '@/modules/analytics/analytics.service';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get('brandId');
  if (!brandId) {
    return apiError('brandId query param is required', 400);
  }

  try {
    const report = await generateWeeklyReport(brandId);
    return apiSuccess(report);
  } catch (err) {
    if (err instanceof AnalyticsError) return apiError(err.message, err.status);
    console.error('Unexpected error in GET /api/analytics/weekly-report:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
