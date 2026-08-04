import { supabaseServer } from '@/lib/supabase-server';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function GET() {
  try {
    const { error } = await supabaseServer.from('users').select('id').limit(1);
    if (error) {
      return apiError('Database unreachable', 503, error.message);
    }
    return apiSuccess({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    return apiError('Health check failed', 503, err instanceof Error ? err.message : String(err));
  }
}
