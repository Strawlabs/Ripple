import { NextRequest } from 'next/server';
import { libraryQuerySchema } from '@/validations/library';
import { listContent, LibraryError } from '@/modules/content/library.service';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);

  const parsed = libraryQuerySchema.safeParse(params);
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten());
  }

  try {
    const result = await listContent(parsed.data);
    return apiSuccess(result);
  } catch (err) {
    if (err instanceof LibraryError) return apiError(err.message, err.status);
    console.error('Unexpected error in GET /api/content/library:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
