import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
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
 * Verifies Meta's X-Hub-Signature-256 header against the raw request
 * body, using the Meta App Secret. This confirms the request actually
 * came from Meta and wasn't spoofed by a third party — the endpoint
 * is public, so without this check anyone who finds the URL could
 * send fake "incoming message" events.
 *
 * Uses timingSafeEqual instead of a plain string compare to avoid
 * leaking timing information about how much of the signature matched.
 */
function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.error('WHATSAPP_APP_SECRET is not set — cannot verify webhook signature');
    return false;
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expectedSignature = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex');
  const receivedSignature = signatureHeader.slice('sha256='.length);

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(receivedSignature, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

/**
 * Receives incoming WhatsApp messages/events.
 *
 * Every request's signature is verified against the Meta App Secret
 * before the body is trusted (see isValidSignature above). Requests
 * that fail verification are rejected with 401 and never reach the
 * message-handling logic.
 *
 * Always returns 200 quickly-ish (for genuinely verified requests) so
 * Meta doesn't retry/disable the webhook — errors in individual
 * message handling are caught and logged rather than surfaced as a
 * failed response.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get('x-hub-signature-256');

  if (!isValidSignature(rawBody, signatureHeader)) {
    console.error('WhatsApp webhook signature verification failed — rejecting request');
    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
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