/**
 * Model IDs — edit this file only to change Gemini models in AI Studio.
 *
 * Transcribe primary: gemini-3.5-transcribe via Interactions API
 *   generation_config.transcription_config (verbatim, non-diarised, en-AU)
 *   Secondary: generateContent + audioTranscriptionConfig.
 *   Fallback: Flash + prompts/transcribe.md (not after 429).
 *
 * Structure / BP / referral: try STRUCTURE_MODELS / VISION_MODELS in order on
 * 429 only — each Flash family often has a separate free-tier bucket.
 * Not Live. Not Batch. Prefer Flash over Pro on free tier.
 *
 * Free tier is RPM/RPD/TPM per model — not patients.
 *
 * Docs:
 * https://ai.google.dev/gemini-api/docs/rate-limits
 * https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/
 */
export const MODELS = {
  /** Pre-recorded STT (not Live). */
  transcribe: 'gemini-3.5-transcribe',
  /** Non-quota STT backup only. */
  transcribeFallback: 'gemini-3.6-flash',
  /** Defaults (first entry of the fallback lists). */
  structure: 'gemini-3.6-flash',
  vision: 'gemini-3.6-flash',
} as const;

/**
 * Note generation + referral extraction — try next model only on 429 / model missing.
 * Skip Pro (tighter free quota). Skip unstable aliases like gemini-flash-latest.
 */
export const STRUCTURE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
] as const;

/** BP screenshot vision — same idea, image-capable Flash models. */
export const VISION_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
] as const;

/** Inline audio+JSON must stay under the Gemini ~20 MB request cap (base64 expands ~4/3). */
export const MAX_CHUNK_BYTES = 9 * 1024 * 1024;

/** Client recorder rotates every 6 min — under Transcribe sync duration caps. */
export const CHUNK_DURATION_MS = 6 * 60 * 1000;

/** Per-request JSON body limit. Chunked audio, not 250 MB whole-consult posts. */
export const JSON_BODY_LIMIT = '20mb';

export const PORT = Number(process.env.PORT) || 3000;
