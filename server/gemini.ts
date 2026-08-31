import {
  AudioTranscriptionConfigMode,
  GoogleGenAI,
  type GenerateContentConfig,
} from '@google/genai';
import { CLINICAL_VOCAB } from './clinicalVocab.ts';

let ai: GoogleGenAI | null = null;

export function hasApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getAI(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }
  return ai;
}

export function inlinePart(data: string, mimeType: string) {
  const payload = data.includes('base64,') ? data.split('base64,')[1] : data;
  return { inlineData: { mimeType, data: payload } };
}

function stripDataUrl(data: string): string {
  return data.includes('base64,') ? data.split('base64,')[1] : data;
}

function textFromResponse(response: {
  text?: string | null;
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string; audioTranscription?: { text?: string } }> };
  }>;
}): string {
  const direct = (response.text || '').trim();
  if (direct) return direct;
  const parts = response.candidates?.[0]?.content?.parts || [];
  const bits: string[] = [];
  for (const p of parts) {
    if (p.text?.trim()) bits.push(p.text.trim());
    if (p.audioTranscription?.text?.trim()) bits.push(p.audioTranscription.text.trim());
  }
  return bits.join('\n').trim();
}

export async function generateText(opts: {
  model: string;
  parts: object[];
  config?: GenerateContentConfig;
}): Promise<string> {
  const response = await getAI().models.generateContent({
    model: opts.model,
    contents: [{ role: 'user', parts: opts.parts as never }],
    config: opts.config,
  });
  return textFromResponse(response);
}

/**
 * Gemini 3.5 Transcribe — AI Studio / GenAI SDK documented path:
 * interactions.create + generation_config.transcription_config
 * (verbatim, no diarization_mode, language hint, custom vocabulary).
 * @see https://dev.to/googleai/stop-wrestling-with-asr-the-complete-guide-to-gemini-35-transcribe-1m6i
 */
async function transcribeViaInteractions(opts: {
  model: string;
  audioBase64: string;
  mimeType: string;
}): Promise<string> {
  const interaction = await getAI().interactions.create({
    model: opts.model,
    store: false,
    input: [
      {
        type: 'audio',
        data: stripDataUrl(opts.audioBase64),
        mime_type: opts.mimeType,
      },
    ],
    generation_config: {
      transcription_config: {
        language_codes: ['en-AU'],
        custom_vocabulary: CLINICAL_VOCAB,
        // Verbatim, non-diarised: omit diarization_mode and timestamp_granularities.
        mode: { type: 'verbatim' },
      },
    },
  });
  return (interaction.output_text || '').trim();
}

/**
 * Cloud Agent Platform shape: generateContent + audioTranscriptionConfig.
 * Kept as secondary if Interactions is unavailable in a given runtime.
 * @see https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-transcribe
 */
async function transcribeViaGenerateContent(opts: {
  model: string;
  audioBase64: string;
  mimeType: string;
}): Promise<string> {
  const response = await getAI().models.generateContent({
    model: opts.model,
    contents: [
      {
        role: 'user',
        parts: [inlinePart(opts.audioBase64, opts.mimeType)] as never,
      },
    ],
    config: {
      audioTranscriptionConfig: {
        // Docs: omit diarization / word timestamps unless needed (we want neither).
        mode: AudioTranscriptionConfigMode.VERBATIM,
        languageCodes: ['en-AU'],
        customVocabulary: CLINICAL_VOCAB,
      },
    },
  });
  return textFromResponse(response);
}

/** Dedicated STT: Interactions (docs) → generateContent AudioTranscriptionConfig. */
export async function generateTranscript(opts: {
  model: string;
  audioBase64: string;
  mimeType: string;
}): Promise<string> {
  try {
    const text = await transcribeViaInteractions(opts);
    if (text) return text;
    console.warn('Interactions STT returned empty; trying generateContent path');
  } catch (err) {
    console.warn('Interactions STT failed; trying generateContent path:', err);
  }
  return transcribeViaGenerateContent(opts);
}

export async function generateJson<T>(opts: {
  model: string;
  parts: object[];
  schema: object;
}): Promise<T> {
  const text = await generateText({
    model: opts.model,
    parts: opts.parts,
    config: {
      responseMimeType: 'application/json',
      responseSchema: opts.schema as GenerateContentConfig['responseSchema'],
    },
  });
  return JSON.parse(text || '{}') as T;
}
