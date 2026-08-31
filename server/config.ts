/**
 * Model IDs — edit this file only to change Gemini models in AI Studio.
 *
 * Transcribe uses Gemini 3.5 Flash because it accepts audio on generateContent
 * (text, image, video, audio, PDF). Docs (May 2026, still current Aug 2026):
 * https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash
 *
 * Do NOT use gemini-3.7-flash — that ID is invalid.
 *
 * Optional dedicated transcribe models (audio-in / text-out only, Aug 2026):
 *   gemini-3.5-transcribe  or  gemini-3.5-transcribe-preview
 * Those cannot structure notes or read BP screenshots. Keep Flash here so
 * transcribe, structure, and BP vision share one free-tier generateContent path.
 *
 * If 3.5-flash is missing in a given Studio runtime, swap all three IDs to the
 * current documented Flash that accepts audio (e.g. gemini-3.6-flash).
 */
export const MODELS = {
  transcribe: 'gemini-3.5-flash',
  structure: 'gemini-3.5-flash',
  vision: 'gemini-3.5-flash',
} as const;

/** Inline audio+JSON must stay under the Gemini ~20 MB request cap (base64 expands ~4/3). */
export const MAX_CHUNK_BYTES = 9 * 1024 * 1024;

/** Client recorder also rotates every 6 minutes so 30–60 min ADHD consults stay under the cap. */
export const CHUNK_DURATION_MS = 6 * 60 * 1000;

/** Per-request JSON body limit. Chunked audio, not 250 MB whole-consult posts. */
export const JSON_BODY_LIMIT = '20mb';

export const PORT = Number(process.env.PORT) || 3000;
