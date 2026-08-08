/**
 * FEATURE-002 — WhatsApp Conversation Engine
 *
 * Thin wrapper around the Meta WhatsApp Cloud API. Kept separate from
 * the webhook handler and business logic so the Graph API version and
 * request shape only need to change in one place.
 */

const GRAPH_API_VERSION = 'v21.0';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const phoneNumberId = requiredEnv('WHATSAPP_PHONE_NUMBER_ID');
  const accessToken = requiredEnv('WHATSAPP_ACCESS_TOKEN');

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error('WhatsApp send failed:', res.status, errText);
    throw new Error(`WhatsApp API returned ${res.status}`);
  }
}
