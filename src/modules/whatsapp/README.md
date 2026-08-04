# WhatsApp Module — FEATURE-002

Handles inbound WhatsApp messages (text, image, voice note, document) via
the Meta Cloud API webhook, and stores conversation history.

## Next steps (checklist Section 4)
- Build `/api/webhooks/whatsapp` route (POST) to receive Meta webhook events
- Handle text messages -> forward to `content` module for generation
- Handle image uploads (single + multi/carousel) -> store in Supabase Storage
- Handle voice notes -> forward to transcription pipeline (see `content` module, FEATURE-010)
- Persist every inbound message to `public.conversations` (BR-WA-001, BR-WA-003)
- Verify Meta webhook signature (X-Hub-Signature-256) before processing

## Business rules
- BR-WA-001: Every WhatsApp message must be linked to a Ripple account
- BR-WA-002: Media files must be stored
- BR-WA-003: Conversation history retained
