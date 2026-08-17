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
// Text generation is unaffected, so only audio transcription uses an
// older, stable multimodal model instead.
const AUDIO_MODEL = 'gemini-2.0-flash';

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

  const response = await client.models.generateContent({
    model: AUDIO_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Transcribe this audio message to plain text. Reply with ONLY the transcription, no commentary or extra formatting.' },
          { inlineData: { mimeType: cleanMimeType, data: base64Audio } },
        ],
      },
    ],
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned an empty transcription');
  }
  return text.trim();
}