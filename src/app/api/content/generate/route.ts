import { NextRequest } from 'next/server';
import { generateContentSchema } from '@/validations/content';
import { generateContent, ContentError } from '@/modules/content/content.service';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const parsed = generateContentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten());
  }

  try {
    const draft = await generateContent(parsed.data);
    return apiSuccess(draft, 201);
  } catch (err) {
    if (err instanceof ContentError) {
      return apiError(err.message, err.status);
    }
    console.error('Unexpected error in /api/content/generate:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
