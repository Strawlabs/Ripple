import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    const scope = 'w_member_social openid profile';
    const state = crypto.randomUUID();

    const brandId = req.nextUrl.searchParams.get('brandId');

    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId!);
    authUrl.searchParams.set('redirect_uri', redirectUri!);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', scope);

    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('linkedin_oauth_state', state, { httpOnly: true, maxAge: 600, path: '/' });
    if (brandId) {
        response.cookies.set('linkedin_oauth_brand_id', brandId, { httpOnly: true, maxAge: 600, path: '/' });
    }

    return response;
}