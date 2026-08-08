import { NextRequest, NextResponse } from 'next/server';
import { parseIncomingMessages } from '@/modules/whatsapp/parse-message';
import { handleIncomingMessage } from '@/modules/whatsapp/whatsapp.service';

/**
 * Meta's webhook verification handshake. When you configure the
 * callback URL in the Meta App Dashboard, Meta sends a GET request
 * with these query params and expects the raw challenge value echoed
 * back if the verify token matches what you configured.
 *
 * WHATSAPP_VERIFY_TOKEN is a string YOU choose (not something Meta
 * gives you) — put the same value in .env.local and in the Meta
 * dashboard's webhook setup screen.
 */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Verification failed', { status: 403 });
}

/**
 * Receives incoming WhatsApp messages/events.
 *
 * NOTE: Signature verification (X-Hub-Signature-256, using the Meta
 * App Secret) is not implemented yet — this endpoint currently trusts
 * any POST body shaped like a valid Meta webhook payload. That's a
 * known gap before this goes to production; see module README.
 *
 * Always returns 200 quickly-ish so Meta doesn't retry/disable the
 * webhook — errors in individual message handling are caught and
 * logged rather than surfaced as a failed response.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    const messages = parseIncomingMessages(body as Parameters<typeof parseIncomingMessages>[0]);
    for (const message of messages) {
      await handleIncomingMessage(message).catch((err) =>
        console.error('Failed to handle WhatsApp message:', err)
      );
    }
  } catch (err) {
    console.error('Failed to process WhatsApp webhook payload:', err);
  }

  return NextResponse.json({ success: true });
}
