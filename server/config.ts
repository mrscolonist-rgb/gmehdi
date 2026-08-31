/**
 * Model IDs — edit this file only to change Gemini models in AI Studio.
 *
 * Transcribe primary: gemini-3.5-transcribe via Interactions API
 *   generation_config.transcription_config (verbatim, non-diarised, en-AU)
 *   per Google GenAI / AI Studio Transcribe docs. Secondary: generateContent
 *   + audioTranscriptionConfig. Fallback: gemini-3.5-flash + prompts/transcribe.md.
 *
 * Structure + BP vision: gemini-3.5-flash.
 * Not Live (gemini-3.5-transcribe-live). Not Batch (unsupported).
 *
 * Chunk ≤6 min stays under Transcribe file-duration limits (~15 min).
 *
 * Docs:
 * https://dev.to/googleai/stop-wrestling-with-asr-the-complete-guide-to-gemini-35-transcribe-1m6i
 * https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-transcribe
 * https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/
 */
export const MODELS = {
  /** Pre-recorded STT (not Live). */
  transcribe: 'gemini-3.5-transcribe',
  /** Free-tier / outage backup — multimodal Flash + prompt. */
  transcribeFallback: 'gemini-3.6-flash',
  structure: 'gemini-3.6-flash',
  vision: 'gemini-3.6-flash',
} as const;

/** Inline audio+JSON must stay under the Gemini ~20 MB request cap (base64 expands ~4/3). */
export const MAX_CHUNK_BYTES = 9 * 1024 * 1024;

/** Client recorder rotates every 6 min — under Transcribe sync duration caps. */
export const CHUNK_DURATION_MS = 6 * 60 * 1000;

/** Per-request JSON body limit. Chunked audio, not 250 MB whole-consult posts. */
export const JSON_BODY_LIMIT = '20mb';

export const PORT = Number(process.env.PORT) || 3000;
