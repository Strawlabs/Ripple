import { supabaseServer } from '@/lib/supabase-server';

/**
 * BR-WA-002 — download WhatsApp media (image/audio/document) from Meta
 * and store it in Supabase Storage, returning a public URL.
 *
 * Meta's media flow is two-step:
 *  1. GET /{media-id} with the access token returns a temporary,
 *     signed download URL (valid for a short time only).
 *  2. GET that URL (with the same access token in the header) returns
 *     the actual binary bytes.
 */
export async function downloadAndStoreWhatsAppMedia(
    mediaId: string,
    mimeType: string | null
): Promise<string | null> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('Missing WHATSAPP_ACCESS_TOKEN, cannot download media');
        return null;
    }

    try {
        // Step 1: resolve the media id to a temporary download URL
        const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!metaRes.ok) {
            console.error('Failed to resolve WhatsApp media URL:', await metaRes.text());
            return null;
        }

        const metaData = await metaRes.json();
        const downloadUrl: string | undefined = metaData.url;

        if (!downloadUrl) {
            console.error('Meta media response had no url field:', metaData);
            return null;
        }

        // Step 2: download the actual file bytes
        const fileRes = await fetch(downloadUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!fileRes.ok) {
            console.error('Failed to download WhatsApp media file:', fileRes.status);
            return null;
        }

        const fileBuffer = await fileRes.arrayBuffer();

        // Pick a reasonable file extension from the mime type
        const extension = mimeTypeToExtension(mimeType);
        const fileName = `${mediaId}${extension}`;

        // Step 3: upload to Supabase Storage
        const { error: uploadError } = await supabaseServer.storage
            .from('whatsapp-media')
            .upload(fileName, fileBuffer, {
                contentType: mimeType ?? 'application/octet-stream',
                upsert: true,
            });

        if (uploadError) {
            console.error('Failed to upload media to Supabase Storage:', uploadError.message);
            return null;
        }

        // Step 4: get the public URL
        const { data: publicUrlData } = supabaseServer.storage
            .from('whatsapp-media')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error('Unexpected error downloading/storing WhatsApp media:', err);
        return null;
    }
}

function mimeTypeToExtension(mimeType: string | null): string {
    if (!mimeType) return '';
    const map: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'audio/ogg': '.ogg',
        'audio/mpeg': '.mp3',
        'audio/amr': '.amr',
        'application/pdf': '.pdf',
    };
    return map[mimeType.split(';')[0].trim()] ?? '';
}