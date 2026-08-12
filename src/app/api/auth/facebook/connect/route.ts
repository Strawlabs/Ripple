import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const clientId = process.env.FACEBOOK_APP_ID;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
    const scope = 'pages_show_list';
    const state = crypto.randomUUID();

    const brandId = req.nextUrl.searchParams.get('brandId');

    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    authUrl.searchParams.set('client_id', clientId!);
    authUrl.searchParams.set('redirect_uri', redirectUri!);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('response_type', 'code');

    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('facebook_oauth_state', state, { httpOnly: true, maxAge: 600, path: '/' });
    if (brandId) {
        response.cookies.set('facebook_oauth_brand_id', brandId, { httpOnly: true, maxAge: 600, path: '/' });
    }

    return response;
}