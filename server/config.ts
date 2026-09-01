/**
 * Model IDs — edit this file only to change models.
 *
 * STT primary: gemini-3.5-transcribe
 * STT backup: Groq whisper-large-v3 (+ medical prompt + optional polish)
 *
 * Structure / BP: try STRUCTURE_MODELS / VISION_MODELS in order on 429.
 * Prefer gemini-3.7-flash first (stronger on long ADHD / complex prompts).
 *
 * Groq LLM last resort after all Gemini Flash buckets: gpt-oss then Qwen
 * (no Llama — weaker on complex clinical note JSON).
 *
 * Free tier is RPM/RPD/TPM per model — not patients. Multi-model cascade
 * spreads load across separate free-tier buckets when available.
 */
export const MODELS = {
  /** Pre-recorded STT (not Live). */
  transcribe: 'gemini-3.5-transcribe',
  /** Non-quota STT backup only (Gemini audio→text). */
  transcribeFallback: 'gemini-3.6-flash',
  /** Defaults (first entry of the fallback lists). */
  structure: 'gemini-3.7-flash',
  vision: 'gemini-3.7-flash',
  /** Groq Whisper — when Gemini STT 429s or Gemini key missing. */
  groqStt: 'whisper-large-v3',
  groqSttFast: 'whisper-large-v3-turbo',
  /** Light Groq chat pass after Whisper — spelling/terms only, not new facts. */
  groqPolish: 'openai/gpt-oss-20b',
} as const;

/**
 * Note generation + referral — try next only on 429 / model missing.
 * 3.7 first for long ADHD / complex style prompts; then other Flash buckets.
 */
export const STRUCTURE_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
] as const;

/** BP screenshot vision — same cascade idea. */
export const VISION_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
] as const;

/**
 * Groq chat after every Gemini structure Flash bucket is exhausted.
 * gpt-oss-120b: reasoning + HealthBench + strict JSON on Groq.
 * Qwen 3.6: thinking mode for complex prompts (preview).
 */
export const GROQ_STRUCTURE_MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.6-27b',
  'openai/gpt-oss-20b',
] as const;

/** Inline audio+JSON must stay under the Gemini ~20 MB request cap (base64 expands ~4/3). */
export const MAX_CHUNK_BYTES = 9 * 1024 * 1024;

/** Client recorder rotates every 6 min — under Transcribe sync duration caps. */
export const CHUNK_DURATION_MS = 6 * 60 * 1000;

/** Per-request JSON body limit. Chunked audio, not 250 MB whole-consult posts. */
export const JSON_BODY_LIMIT = '20mb';

export const PORT = Number(process.env.PORT) || 3000;
