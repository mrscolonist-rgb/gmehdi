import {
  AudioTranscriptionConfigMode,
  GoogleGenAI,
  type GenerateContentConfig,
} from '@google/genai';
import { formatGeminiError, hasApiKey, resolveApiKey } from './apiKey.ts';
import { CLINICAL_VOCAB } from './clinicalVocab.ts';

export { hasApiKey, formatGeminiError } from './apiKey.ts';

let ai: GoogleGenAI | null = null;
let aiKeyUsed = '';

export function getAI(): GoogleGenAI {
  const key = resolveApiKey();
  if (!key) {
    throw new Error(
      'GEMINI_API_KEY is not set. In AI Studio: Secrets → GEMINI_API_KEY. Locally: .env.local then restart.',
    );
  }
  if (!ai || aiKeyUsed !== key) {
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
    aiKeyUsed = key;
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
  try {
    const response = await getAI().models.generateContent({
      model: opts.model,
      contents: [{ role: 'user', parts: opts.parts as never }],
      config: opts.config,
    });
    return textFromResponse(response);
  } catch (error) {
    throw new Error(formatGeminiError(error));
  }
}

/**
 * Gemini 3.5 Transcribe — Interactions + transcription_config (verbatim, non-diarised).
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
        mode: { type: 'verbatim' },
      },
    },
  });
  return (interaction.output_text || '').trim();
}

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
        mode: AudioTranscriptionConfigMode.VERBATIM,
        languageCodes: ['en-AU'],
        customVocabulary: CLINICAL_VOCAB,
      },
    },
  });
  return textFromResponse(response);
}

/** Dedicated STT: Interactions → generateContent AudioTranscriptionConfig. */
export async function generateTranscript(opts: {
  model: string;
  audioBase64: string;
  mimeType: string;
}): Promise<string> {
  if (!hasApiKey()) {
    throw new Error(formatGeminiError(new Error('missing key')));
  }
  try {
    const text = await transcribeViaInteractions(opts);
    if (text) return text;
    console.warn('Interactions STT returned empty; trying generateContent path');
  } catch (err) {
    console.warn('Interactions STT failed; trying generateContent path:', err);
  }
  try {
    return await transcribeViaGenerateContent(opts);
  } catch (error) {
    throw new Error(formatGeminiError(error));
  }
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
