export interface ParsedMessage {
  from: string;
  type: 'text' | 'image' | 'audio' | 'document' | 'unsupported';
  text: string | null;
  mediaId: string | null;
  mimeType: string | null;
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
        return { from: m.from, type: 'text', text: m.text?.body ?? null, mediaId: null, mimeType: null };
      case 'image':
        return { from: m.from, type: 'image', text: null, mediaId: m.image?.id ?? null, mimeType: m.image?.mime_type ?? null };
      case 'audio':
        return { from: m.from, type: 'audio', text: null, mediaId: m.audio?.id ?? null, mimeType: m.audio?.mime_type ?? null };
      case 'document':
        return { from: m.from, type: 'document', text: null, mediaId: m.document?.id ?? null, mimeType: m.document?.mime_type ?? null };
      default:
        return { from: m.from, type: 'unsupported', text: null, mediaId: null, mimeType: null };
    }
  });
}