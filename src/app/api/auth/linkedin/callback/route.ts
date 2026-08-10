import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

function getAppUrl(): string {
    if (process.env.LINKEDIN_REDIRECT_URI) {
        return new URL(process.env.LINKEDIN_REDIRECT_URI).origin;
    }
    return 'http://localhost:3000';
}

export async function GET(req: NextRequest) {
    const appUrl = getAppUrl();
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const storedState = req.cookies.get('linkedin_oauth_state')?.value;
    const brandId = req.cookies.get('linkedin_oauth_brand_id')?.value;

    if (!code || !state || state !== storedState || !brandId) {
        return NextResponse.redirect(`${appUrl}/social-accounts?error=invalid_state`);
    }

    try {
        const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
                client_id: process.env.LINKEDIN_CLIENT_ID!,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
            console.error('LinkedIn token exchange failed:', tokenData);
            return NextResponse.redirect(`${appUrl}/social-accounts?error=token_exchange_failed`);
        }

        // Fetch the LinkedIn person ID (needed later to publish posts)
        let personId: string | null = null;
        try {
            const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            if (userInfoRes.ok) {
                const userInfo = await userInfoRes.json();
                personId = userInfo.sub ?? null;
            } else {
                console.error('Failed to fetch LinkedIn userinfo:', await userInfoRes.text());
            }
        } catch (err) {
            console.error('Error fetching LinkedIn userinfo:', err);
        }

        const { data: updatedRows, error } = await supabaseServer
            .from('social_accounts')
            .update({
                access_token: tokenData.access_token,
                status: 'connected',
                platform_user_id: personId,
            })
            .eq('brand_id', brandId)
            .eq('platform', 'LinkedIn')
            .select();

        if (error) {
            console.error('Failed to save LinkedIn token:', error.message);
            return NextResponse.redirect(`${appUrl}/social-accounts?error=save_failed`);
        }

        if (!updatedRows || updatedRows.length === 0) {
            const { error: insertError } = await supabaseServer
                .from('social_accounts')
                .insert({
                    brand_id: brandId,
                    platform: 'LinkedIn',
                    access_token: tokenData.access_token,
                    status: 'connected',
                    platform_user_id: personId,
                });

            if (insertError) {
                console.error('Failed to insert LinkedIn token:', insertError.message);
                return NextResponse.redirect(`${appUrl}/social-accounts?error=save_failed`);
            }
        }

        const response = NextResponse.redirect(`${appUrl}/social-accounts?connected=linkedin`);
        response.cookies.delete('linkedin_oauth_state');
        response.cookies.delete('linkedin_oauth_brand_id');
        return response;
    } catch (err) {
        console.error('LinkedIn callback error:', err);
        return NextResponse.redirect(`${appUrl}/social-accounts?error=unknown`);
    }
}