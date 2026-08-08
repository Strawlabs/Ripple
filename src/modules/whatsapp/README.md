# WhatsApp Module — FEATURE-002

Handles inbound WhatsApp messages via the Meta Cloud API webhook, and
stores conversation history.

## Done
- `whatsapp-client.ts` — sendWhatsAppText() via Meta Graph API
- `parse-message.ts` — parses Meta's webhook payload shape into a flat
  ParsedMessage (text / image / audio / document)
- `detect-intent.ts` — simple pattern match for "Create a <platform>
  post about <topic>" style requests (matches the PRD's example inputs)
- `whatsapp.service.ts` — handleIncomingMessage():
  - BR-WA-001: links the sender's number to a Ripple account via
    `users.whatsapp`, then their brand. Unregistered senders get a
    reply telling them to register, and nothing is stored (per BR-WA-001
    nothing can be linked yet).
  - BR-WA-003: every text message is saved to `conversations`
  - Text messages matching a content request call the existing
    `generateContent()` (FEATURE-003) and reply with the draft,
    telling the user to open the app to approve it
  - Text messages that don't match anything get a helpful reply
    instead of being silently ignored
- `GET /api/webhooks/whatsapp` — Meta's verification handshake
- `POST /api/webhooks/whatsapp` — receives messages

## Known gaps (documented, not faked)
- **BR-WA-002 (media files must be stored)**: image/audio/document
  messages are currently only recorded as an event (media id + type in
  `conversations`) — the actual binary is NOT downloaded from Meta and
  uploaded to Supabase Storage yet. Next step: fetch the media URL from
  Meta using the media id, download it, upload to a Supabase Storage
  bucket, store the resulting URL instead of the raw media id.
- **Webhook signature verification**: `X-Hub-Signature-256` (using the
  Meta App Secret) is not checked yet — the endpoint currently trusts
  any correctly-shaped POST body. Needed before production use.
- **Voice-to-Post (FEATURE-010)**: depends on the media download above
  plus a transcription step (e.g. Whisper) — not started.
- Only tested with hand-crafted payloads matching Meta's documented
  shape — not yet tested against a real webhook delivery from Meta
  (requires the callback URL to be publicly reachable, e.g. via ngrok
  for local dev, which wasn't set up this session).

## Business rules
- BR-WA-001: Every WhatsApp message must be linked to a Ripple account — done
- BR-WA-002: Media files must be stored — partially done (event recorded, binary not yet stored)
- BR-WA-003: Conversation history retained — done
