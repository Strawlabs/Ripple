import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

function getAppUrl(): string {
    if (process.env.TWITTER_REDIRECT_URI) {
        return new URL(process.env.TWITTER_REDIRECT_URI).origin;
    }
    return 'http://localhost:3000';
}

export async function GET(req: NextRequest) {
    const appUrl = getAppUrl();
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const storedState = req.cookies.get('twitter_oauth_state')?.value;
    const codeVerifier = req.cookies.get('twitter_code_verifier')?.value;
    const brandId = req.cookies.get('twitter_oauth_brand_id')?.value;

    if (!code || !state || state !== storedState || !codeVerifier || !brandId) {
        return NextResponse.redirect(`${appUrl}/social-accounts?error=invalid_state`);
    }

    try {
        // X requires the client_id in the body AND HTTP Basic auth with
        // client_id:client_secret for confidential clients.
        const basicAuth = Buffer.from(
            `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64');

        const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.TWITTER_REDIRECT_URI!,
                client_id: process.env.TWITTER_CLIENT_ID!,
                code_verifier: codeVerifier,
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
            console.error('Twitter token exchange failed:', tokenData);
            return NextResponse.redirect(`${appUrl}/social-accounts?error=token_exchange_failed`);
        }

        // Fetch the X user id — not strictly needed to post (the token
        // identifies the user), but stored for consistency with the other
        // platforms and useful for building post URLs later.
        let twitterUserId: string | null = null;
        try {
            const meRes = await fetch('https://api.twitter.com/2/users/me', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            if (meRes.ok) {
                const me = await meRes.json();
                twitterUserId = me?.data?.id ?? null;
            } else {
                console.error('Failed to fetch Twitter user:', await meRes.text());
            }
        } catch (err) {
            console.error('Error fetching Twitter user:', err);
        }

        const accountFields = {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token ?? null,
            status: 'connected',
            platform_user_id: twitterUserId,
        };

        const { data: updatedRows, error } = await supabaseServer
            .from('social_accounts')
            .update(accountFields)
            .eq('brand_id', brandId)
            .eq('platform', 'Twitter')
            .select();

        if (error) {
            console.error('Failed to save Twitter token:', error.message);
            return NextResponse.redirect(`${appUrl}/social-accounts?error=save_failed`);
        }

        if (!updatedRows || updatedRows.length === 0) {
            const { error: insertError } = await supabaseServer
                .from('social_accounts')
                .insert({ brand_id: brandId, platform: 'Twitter', ...accountFields });

            if (insertError) {
                console.error('Failed to insert Twitter token:', insertError.message);
                return NextResponse.redirect(`${appUrl}/social-accounts?error=save_failed`);
            }
        }

        const response = NextResponse.redirect(`${appUrl}/social-accounts?connected=twitter`);
        response.cookies.delete('twitter_oauth_state');
        response.cookies.delete('twitter_code_verifier');
        response.cookies.delete('twitter_oauth_brand_id');
        return response;
    } catch (err) {
        console.error('Twitter callback error:', err);
        return NextResponse.redirect(`${appUrl}/social-accounts?error=unknown`);
    }
}
