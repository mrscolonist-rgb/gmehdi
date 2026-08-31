/**
 * Model IDs — edit this file only to change Gemini models in AI Studio.
 *
 * Transcribe primary: gemini-3.5-transcribe (recorded STT, non-diarised).
 * Transcribe fallback: gemini-3.5-flash (multimodal audio + prompt) when primary
 * fails, returns empty, or is unavailable on free tier — so Stop & transcribe
 * still works. Structure + BP vision stay on Flash.
 *
 * Not Live stream. Not Batch inference (unsupported for the Transcribe family).
 *
 * Docs:
 * https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/
 * https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-transcribe
 */
export const MODELS = {
  transcribe: 'gemini-3.5-transcribe',
  /** Free-tier / outage backup — same Flash path that previously did all STT. */
  transcribeFallback: 'gemini-3.5-flash',
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
