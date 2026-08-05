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
