import { GoogleGenAI } from '@google/genai';

/**
 * FEATURE-003 — AI Content Generation
 * "Gemini First Strategy": Gemini 2.5 is the MVP AI provider.
 *
 * This file is intentionally the ONLY place that talks to the Gemini SDK
 * directly. Everything else in the content module calls `generateText()`
 * below. To add Claude/GPT/Ollama later (checklist Rule 6), add a sibling
 * adapter with the same `generateText(prompt: string): Promise<string>`
 * shape and swap it in from content.service.ts — no other file changes.
 */
const apiKey = process.env.GEMINI_API_KEY || '';
const client = new GoogleGenAI({ apiKey });
const MODEL = 'gemini-3.6-flash';
// gemini-3.x models have a known Google-side bug returning 500 INTERNAL
// for ANY audio input (reported upstream: googleapis/python-genai#2714).
// Text generation is unaffected, so only audio transcription avoids it.
//
// Model availability has been shifting fast in this environment
// (gemini-2.5-flash deprecated for new users, then gemini-2.0-flash
// also stopped being available shortly after) — so instead of hardcoding
// one audio model, try a short list in order and fall back automatically
// if one is deprecated (404) or hits the known 3.x audio bug (500).
const AUDIO_MODEL_CANDIDATES = ['gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];

export async function generateText(prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await client.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned an empty response');
  }
  return text.trim();
}

/**
 * FEATURE-010 — Voice-to-Post
 * Transcribes a WhatsApp voice note (audio bytes) to plain text using
 * Gemini's multimodal input support. mimeType should match what Meta
 * sent (e.g. "audio/ogg; codecs=opus" — Gemini accepts the codecs
 * suffix as part of the mime type string).
 */
export async function transcribeAudio(audioBuffer: ArrayBuffer, mimeType: string): Promise<string> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const base64Audio = Buffer.from(audioBuffer).toString('base64');
  // WhatsApp sends mime types like "audio/ogg; codecs=opus" — Gemini's
  // inlineData.mimeType expects a bare type like "audio/ogg", so strip
  // any parameters after the semicolon.
  const cleanMimeType = mimeType.split(';')[0].trim();

  const response = await tryModelsInOrder(cleanMimeType, base64Audio);

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned an empty transcription');
  }
  return text.trim();
}

async function tryModelsInOrder(mimeType: string, base64Audio: string) {
  let lastError: unknown;

  for (const model of AUDIO_MODEL_CANDIDATES) {
    try {
      return await client.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Transcribe this audio message to plain text. Reply with ONLY the transcription, no commentary or extra formatting.' },
              { inlineData: { mimeType, data: base64Audio } },
            ],
          },
        ],
      });
    } catch (err) {
      console.error(`Audio transcription failed with model '${model}':`, err);
      lastError = err;
      // Try the next candidate — this error could mean the model was
      // deprecated (404) or hit the known 3.x audio bug (500); either
      // way, the next model in the list might work.
    }
  }

  throw lastError instanceof Error ? lastError : new Error('All audio transcription models failed');
}