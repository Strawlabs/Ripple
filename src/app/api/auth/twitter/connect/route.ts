import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function base64URLEncode(buffer: Buffer): string {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * FEATURE-005 — Social Publishing (X / Twitter)
 *
 * Unlike LinkedIn and Facebook, X's OAuth 2.0 requires PKCE
 * (Proof Key for Code Exchange): we generate a random code_verifier,
 * send its SHA-256 hash as code_challenge here, then send the original
 * verifier back during the token exchange in the callback. The verifier
 * is stashed in an httpOnly cookie in between.
 *
 * Scopes:
 *  - tweet.write   — post on the user's behalf
 *  - tweet.read / users.read — required companions for tweet.write
 *  - offline.access — get a refresh token (X access tokens expire in 2h)
 */
export async function GET(req: NextRequest) {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = process.env.TWITTER_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        console.error('TWITTER_CLIENT_ID or TWITTER_REDIRECT_URI is not configured');
        const origin = req.nextUrl.origin;
        return NextResponse.redirect(`${origin}/social-accounts?error=twitter_not_configured`);
    }

    const state = crypto.randomUUID();
    const codeVerifier = base64URLEncode(crypto.randomBytes(32));
    const codeChallenge = base64URLEncode(
        crypto.createHash('sha256').update(codeVerifier).digest()
    );

    const brandId = req.nextUrl.searchParams.get('brandId');

    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('twitter_oauth_state', state, { httpOnly: true, maxAge: 600, path: '/' });
    response.cookies.set('twitter_code_verifier', codeVerifier, { httpOnly: true, maxAge: 600, path: '/' });
    if (brandId) {
        response.cookies.set('twitter_oauth_brand_id', brandId, { httpOnly: true, maxAge: 600, path: '/' });
    }

    return response;
}
