# Content Module — FEATURE-003, FEATURE-010

AI content generation (Gemini 2.5), prompt building, and Brand Memory
injection. Also owns the Voice-to-Post pipeline (transcription -> AI
cleanup -> generation).

## Done
- `gemini.provider.ts` — Gemini 2.5 client (only file that talks to the
  Gemini SDK; swap in Claude/GPT/Ollama here later per Rule 6)
- `prompt-builder.ts` — per-platform prompts with Brand Memory injected,
  versioned via `PROMPT_VERSION` (Rule 7)
- `content.service.ts` — orchestration: load brand + brand_memory,
  generate per platform, save to content_drafts
- `POST /api/content/generate` — wired end-to-end, tested

## Next steps
- PATCH /api/content/drafts/:id — edit-before-approval (BR-AI-003)
- Voice-to-post pipeline (FEATURE-010): transcription -> AI cleanup -> this module's generateContent()

## Business rules
- BR-AI-001: Each platform receives unique formatting — done (prompt-builder.ts)
- BR-AI-002: Brand Memory must influence generated content — done (content.service.ts)
- BR-AI-003: Generated content must be editable — pending (needs PATCH endpoint)
