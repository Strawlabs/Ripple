import { NextRequest } from 'next/server';
import { registerSchema } from '@/validations/auth';
import { registerUser, AuthError } from '@/modules/auth/auth.service';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten());
  }

  try {
    const user = await registerUser(parsed.data);
    return apiSuccess(user, 201);
  } catch (err) {
    if (err instanceof AuthError) {
      return apiError(err.message, err.status);
    }
    console.error('Unexpected error in /api/auth/register:', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
