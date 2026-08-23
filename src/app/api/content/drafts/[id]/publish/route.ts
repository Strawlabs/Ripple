import { NextRequest } from 'next/server';
import { publishToLinkedIn, PublishError } from '@/modules/publishing/linkedin-publish.service';
import { publishToFacebook } from '@/modules/publishing/facebook-publish.service';
import { getDraftBrandId, ApprovalError } from '@/modules/publishing/approval.service';
import { requireAuth, requireBrandAccess, AuthenticationError } from '@/modules/auth/require-auth';
import { apiSuccess, apiError } from '@/utils/api-response';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    let platform: string = 'linkedin';
    try {
        const body = await req.json();
        if (body?.platform) platform = body.platform;
    } catch {
        // No body / not JSON — default to 'linkedin' for backward compatibility.
    }

    if (platform !== 'linkedin' && platform !== 'facebook') {
        return apiError(`Unsupported platform '${platform}'. Must be 'linkedin' or 'facebook'.`, 400);
    }

    try {
        const user = await requireAuth(req);
        const brandId = await getDraftBrandId(id);
        await requireBrandAccess(user, brandId);

        const result = platform === 'linkedin' ? await publishToLinkedIn(id) : await publishToFacebook(id);
        return apiSuccess(result);
    } catch (err) {
        if (err instanceof AuthenticationError) return apiError(err.message, err.status);
        if (err instanceof ApprovalError) return apiError(err.message, err.status);
        if (err instanceof PublishError) return apiError(err.message, err.status);
        console.error('Unexpected error in POST /api/content/drafts/[id]/publish:', err);
        return apiError('Something went wrong. Please try again.', 500);
    }
}
