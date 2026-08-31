import {
  AudioTranscriptionConfigMode,
  GoogleGenAI,
  type GenerateContentConfig,
} from '@google/genai';

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

function textFromResponse(response: {
  text?: string | null;
  candidates?: Array<{ content?: { parts?: Array<{ text?: string; audioTranscription?: { text?: string } }> } }>;
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

/** Dedicated STT path: recorded audio, non-diarised, verbatim. */
export async function generateTranscript(opts: {
  model: string;
  audioBase64: string;
  mimeType: string;
}): Promise<string> {
  const response = await getAI().models.generateContent({
    model: opts.model,
    contents: [{ role: 'user', parts: [inlinePart(opts.audioBase64, opts.mimeType)] as never }],
    config: {
      audioTranscriptionConfig: {
        diarization: false,
        wordTimestamp: false,
        mode: AudioTranscriptionConfigMode.VERBATIM,
        languageCodes: ['en-AU'],
      },
    },
  });
  return textFromResponse(response);
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
