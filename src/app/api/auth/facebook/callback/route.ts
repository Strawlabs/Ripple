import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

function getAppUrl(): string {
    if (process.env.FACEBOOK_REDIRECT_URI) {
        return new URL(process.env.FACEBOOK_REDIRECT_URI).origin;
    }
    return 'http://localhost:3000';
}

export async function GET(req: NextRequest) {
    const appUrl = getAppUrl();
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const storedState = req.cookies.get('facebook_oauth_state')?.value;
    const brandId = req.cookies.get('facebook_oauth_brand_id')?.value;

    if (!code || !state || state !== storedState || !brandId) {
        return NextResponse.redirect(`${appUrl}/social-accounts?error=invalid_state`);
    }

    try {
        // 1. Exchange code for a short-lived user access token
        const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
        tokenUrl.searchParams.set('client_id', process.env.FACEBOOK_APP_ID!);
        tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET!);
        tokenUrl.searchParams.set('redirect_uri', process.env.FACEBOOK_REDIRECT_URI!);
        tokenUrl.searchParams.set('code', code);

        const tokenRes = await fetch(tokenUrl.toString());
        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
            console.error('Facebook token exchange failed:', tokenData);
            return NextResponse.redirect(`${appUrl}/social-accounts?error=token_exchange_failed`);
        }

        const userAccessToken = tokenData.access_token;

        // 2. Get the list of Pages this user manages (with a Page access token for each)
        const pagesRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?access_token=${userAccessToken}`
        );
        const pagesData = await pagesRes.json();

        if (!pagesRes.ok || !pagesData.data || pagesData.data.length === 0) {
            console.error('Facebook pages fetch failed:', pagesData);
            return NextResponse.redirect(`${appUrl}/social-accounts?error=no_pages_found`);
        }

        // Use the first Page the user manages
        const page = pagesData.data[0];
        const pageAccessToken = page.access_token;
        const pageId = page.id;

        // 3. Save the Page access token + Page ID
        const { data: updatedRows, error } = await supabaseServer
            .from('social_accounts')
            .update({
                access_token: pageAccessToken,
                platform_user_id: pageId,
                status: 'connected',
            })
            .eq('brand_id', brandId)
            .eq('platform', 'Facebook')
            .select();

        if (error) {
            console.error('Failed to save Facebook token:', error.message);
            return NextResponse.redirect(`${appUrl}/social-accounts?error=save_failed`);
        }

        if (!updatedRows || updatedRows.length === 0) {
            const { error: insertError } = await supabaseServer
                .from('social_accounts')
                .insert({
                    brand_id: brandId,
                    platform: 'Facebook',
                    access_token: pageAccessToken,
                    platform_user_id: pageId,
                    status: 'connected',
                });

            if (insertError) {
                console.error('Failed to insert Facebook token:', insertError.message);
                return NextResponse.redirect(`${appUrl}/social-accounts?error=save_failed`);
            }
        }

        const response = NextResponse.redirect(`${appUrl}/social-accounts?connected=facebook`);
        response.cookies.delete('facebook_oauth_state');
        response.cookies.delete('facebook_oauth_brand_id');
        return response;
    } catch (err) {
        console.error('Facebook callback error:', err);
        return NextResponse.redirect(`${appUrl}/social-accounts?error=unknown`);
    }
}