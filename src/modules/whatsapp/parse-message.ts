/**
 * Meta sends a fairly deeply nested payload. This extracts just what
 * Ripple needs: who sent it, what kind of message it is, and the
 * content (text body, or a media id for image/audio/document).
 */

export interface ParsedMessage {
  from: string; // WhatsApp number, e.g. "919876543210" (no +)
  type: 'text' | 'image' | 'audio' | 'document' | 'unsupported';
  text: string | null;
  mediaId: string | null;
}

interface MetaMessage {
  from: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type?: string };
  audio?: { id: string; mime_type?: string };
  document?: { id: string; mime_type?: string };
}

interface MetaWebhookBody {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: MetaMessage[];
      };
    }>;
  }>;
}

export function parseIncomingMessages(body: MetaWebhookBody): ParsedMessage[] {
  const messages: MetaMessage[] =
    body.entry?.flatMap((e) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []) ?? [];

  return messages.map((m) => {
    switch (m.type) {
      case 'text':
        return { from: m.from, type: 'text', text: m.text?.body ?? null, mediaId: null };
      case 'image':
        return { from: m.from, type: 'image', text: null, mediaId: m.image?.id ?? null };
      case 'audio':
        return { from: m.from, type: 'audio', text: null, mediaId: m.audio?.id ?? null };
      case 'document':
        return { from: m.from, type: 'document', text: null, mediaId: m.document?.id ?? null };
      default:
        return { from: m.from, type: 'unsupported', text: null, mediaId: null };
    }
  });
}
