import { supabaseServer } from '@/lib/supabase-server';
import { sendWhatsAppText } from './whatsapp-client';
import { detectContentRequest } from './detect-intent';
import { generateContent } from '@/modules/content/content.service';
import type { ParsedMessage } from './parse-message';

/**
 * FEATURE-002 — WhatsApp Conversation Engine
 *
 * BR-WA-001: Every WhatsApp message must be linked to a Ripple account.
 * We match the sender's WhatsApp number against public.users.whatsapp,
 * then use that user's brand (assumes one brand per user, same
 * assumption used everywhere else in this codebase — see FEATURE-009
 * Multi-Account Management for the future multi-brand case).
 *
 * Unrecognized senders (no matching account) are not silently dropped —
 * we reply telling them to register first, and do NOT store a
 * conversation row (nothing to link it to, and BR-WA-001 requires the
 * link to exist).
 */
async function findBrandForSender(whatsappNumber: string): Promise<{ userId: string; brandId: string } | null> {
  // Meta sends numbers without a leading '+' (e.g. "919876543210").
  // Our users.whatsapp column stores E.164 with '+' (see validations/auth.ts),
  // so we check both forms.
  const candidates = [whatsappNumber, `+${whatsappNumber}`];

  const { data: user } = await supabaseServer
    .from('users')
    .select('id')
    .in('whatsapp', candidates)
    .maybeSingle();

  if (!user) return null;

  const { data: brand } = await supabaseServer
    .from('brands')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!brand) return null;

  return { userId: user.id, brandId: brand.id };
}

async function saveConversation(brandId: string, whatsappNumber: string, messageType: string, content: string | null) {
  const { error } = await supabaseServer.from('conversations').insert({
    brand_id: brandId,
    whatsapp_number: whatsappNumber,
    message_type: messageType,
    content,
  });
  if (error) {
    console.error('Failed to save conversation:', error.message);
  }
}

export async function handleIncomingMessage(message: ParsedMessage): Promise<void> {
  const account = await findBrandForSender(message.from);

  if (!account) {
    // BR-WA-001 — can't link this message to any Ripple account.
    await sendWhatsAppText(
      message.from,
      "We couldn't find a Ripple account linked to this WhatsApp number. Please register at the Ripple app first, using this number."
    ).catch((err) => console.error('Failed to send unregistered-sender reply:', err));
    return;
  }

  const { brandId } = account;

  if (message.type !== 'text') {
    // BR-WA-002: Media files must be stored.
    // NOTE: this currently records that media arrived (id + type) but
    // does NOT yet download the binary from Meta and upload it to
    // Supabase Storage — that's the next step for this module (see
    // README). Recording the event is still useful for conversation
    // history (BR-WA-003) in the meantime.
    await saveConversation(brandId, message.from, message.type, message.mediaId);
    await sendWhatsAppText(
      message.from,
      `Got your ${message.type}! Full ${message.type} processing (like turning a voice note into a post) is coming soon — for now, try sending a text like "Create a LinkedIn post about <topic>".`
    ).catch((err) => console.error('Failed to send media-received reply:', err));
    return;
  }

  await saveConversation(brandId, message.from, 'text', message.text);

  const request = message.text ? detectContentRequest(message.text) : null;

  if (!request) {
    await sendWhatsAppText(
      message.from,
      'Got it! To generate a post, try: "Create a LinkedIn post about <your topic>".'
    ).catch((err) => console.error('Failed to send acknowledgment:', err));
    return;
  }

  try {
    const draft = await generateContent({
      brandId,
      topic: request.topic,
      platforms: [request.platform],
    });

    const platformKey = `${request.platform}_content` as keyof typeof draft;
    const generatedText = (draft[platformKey] as string | null) ?? '(generation succeeded but content was empty)';

    await sendWhatsAppText(
      message.from,
      `Here's your ${request.platform} post draft:\n\n${generatedText}\n\nOpen the Ripple app to review and approve it before it goes live.`
    );
  } catch (err) {
    console.error('WhatsApp-triggered generation failed:', err);
    await sendWhatsAppText(
      message.from,
      "Sorry, something went wrong generating that post. Please try again from the Ripple app."
    ).catch(() => undefined);
  }
}
