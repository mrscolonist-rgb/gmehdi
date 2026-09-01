import { GROQ_STRUCTURE_MODELS, MODELS } from './config.ts';
import { groqWhisperPrompt } from './clinicalVocab.ts';

const GROQ_BASE = 'https://api.groq.com/openai/v1';

export function resolveGroqKey(): string {
  return (process.env.GROQ_API_KEY || '').trim();
}

export function hasGroqKey(): boolean {
  return Boolean(resolveGroqKey());
}

function stripBase64(data: string): string {
  return data.includes('base64,') ? data.split('base64,')[1] : data;
}

function extForMime(mime: string): string {
  const m = (mime || '').split(';')[0].trim().toLowerCase();
  if (m.includes('mp4') || m.includes('m4a')) return 'mp4';
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
  if (m.includes('wav')) return 'wav';
  if (m.includes('ogg') || m.includes('opus')) return 'ogg';
  if (m.includes('flac')) return 'flac';
  return 'webm';
}

async function groqTranscribeModel(
  model: string,
  audioBase64: string,
  mimeType: string,
): Promise<string> {
  const key = resolveGroqKey();
  if (!key) throw new Error('GROQ_API_KEY is not set.');
  const buf = Buffer.from(stripBase64(audioBase64), 'base64');
  const mime = mimeType.split(';')[0].trim() || 'audio/webm';
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(buf)], { type: mime }), `chunk.${extForMime(mime)}`);
  form.append('model', model);
  form.append('language', 'en');
  form.append('response_format', 'text');
  form.append('prompt', groqWhisperPrompt());

  const res = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Groq STT ${res.status}: ${raw.slice(0, 400)}`);
  }
  return raw.trim();
}

/** Whisper large then turbo. Same free audio-seconds bucket. */
export async function transcribeWithGroq(audioBase64: string, mimeType: string): Promise<{
  transcript: string;
  model: string;
}> {
  try {
    const transcript = await groqTranscribeModel(MODELS.groqStt, audioBase64, mimeType);
    if (transcript) return { transcript, model: MODELS.groqStt };
  } catch (err) {
    console.warn('Groq whisper-large-v3 failed; trying turbo:', err);
  }
  const transcript = await groqTranscribeModel(MODELS.groqSttFast, audioBase64, mimeType);
  if (!transcript) throw new Error('Groq STT returned empty text.');
  return { transcript, model: MODELS.groqSttFast };
}

function parseJsonObject(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(trimmed);
}

async function groqChatJson(model: string, userText: string): Promise<unknown> {
  const key = resolveGroqKey();
  if (!key) throw new Error('GROQ_API_KEY is not set.');
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You output JSON only. Match the requested keys. Empty string or [] if unknown. Do not invent clinical facts.',
        },
        { role: 'user', content: userText },
      ],
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`Groq LLM ${res.status}: ${raw.slice(0, 400)}`);
  const body = JSON.parse(raw) as { choices?: Array<{ message?: { content?: string } }> };
  const content = body.choices?.[0]?.message?.content || '';
  return parseJsonObject(content);
}

export async function generateJsonWithGroq<T>(userText: string): Promise<{ data: T; model: string }> {
  let last: unknown;
  for (const model of GROQ_STRUCTURE_MODELS) {
    try {
      const data = (await groqChatJson(model, userText)) as T;
      return { data, model: `groq:${model}` };
    } catch (err) {
      last = err;
      console.warn(`Groq structure model ${model} failed:`, err);
    }
  }
  throw last instanceof Error ? last : new Error('Groq structure failed.');
}

export function partsToText(parts: object[]): string {
  return parts
    .map((p) => {
      const rec = p as { text?: string; inlineData?: unknown };
      if (rec.text?.trim()) return rec.text.trim();
      if (rec.inlineData) return '[image omitted — Groq text fallback cannot read screenshots]';
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
}

export function partsHaveImages(parts: object[]): boolean {
  return parts.some((p) => Boolean((p as { inlineData?: unknown }).inlineData));
}
