import { GoogleGenAI, type GenerateContentConfig } from '@google/genai';

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
  return (response.text || '').trim();
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
