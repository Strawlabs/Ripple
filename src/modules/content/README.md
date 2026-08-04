# Content Module — FEATURE-003, FEATURE-010

AI content generation (Gemini 2.5), prompt building, and Brand Memory
injection. Also owns the Voice-to-Post pipeline (transcription -> AI
cleanup -> generation).

## Next steps (checklist Section 5, 11)
- Integrate Gemini 2.5 client ("Gemini First Strategy")
- Build a provider adapter interface so Claude/GPT/Ollama can be swapped in later
- Prompt builder with per-platform formatting (BR-AI-001)
- Inject Brand Memory (public.brand_memory) into every generation call (BR-AI-002)
- Version control prompts (store prompt templates, don't hardcode inline)
- Voice-to-post: transcription -> AI cleanup -> content generation

## Business rules
- BR-AI-001: Each platform receives unique formatting
- BR-AI-002: Brand Memory must influence generated content
- BR-AI-003: Generated content must be editable
