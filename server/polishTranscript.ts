import { MODELS } from './config.ts';
import { CLINICAL_VOCAB } from './clinicalVocab.ts';
import { resolveGroqKey } from './groq.ts';

const GROQ_BASE = 'https://api.groq.com/openai/v1';

/**
 * Light ASR cleanup after Groq Whisper. Spelling / punctuation / known clinical
 * terms only — never invent history, meds, doses, or findings.
 * On any failure, return the original transcript so the consult is not lost.
 */
export async function polishAsrTranscript(raw: string): Promise<{
  transcript: string;
  polished: boolean;
  model?: string;
}> {
  const text = (raw || '').trim();
  if (!text || !resolveGroqKey()) return { transcript: text, polished: false };

  const model = MODELS.groqPolish;
  const system = [
    'You clean Australian GP medical ASR transcripts.',
    'Fix only obvious speech-to-text errors: drug names, clinical terms, punctuation, and Australian spelling.',
    `Prefer these spellings when the audio likely meant them: ${CLINICAL_VOCAB.join(', ')}.`,
    'Do NOT add, remove, or invent clinical facts, symptoms, doses, or decisions.',
    'Do NOT summarise. Return the full transcript only — no preamble.',
  ].join(' ');

  try {
    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resolveGroqKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: text },
        ],
      }),
    });
    const body = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };
    if (!res.ok) {
      console.warn('ASR polish failed:', body.error?.message || res.status);
      return { transcript: text, polished: false };
    }
    const out = (body.choices?.[0]?.message?.content || '').trim();
    if (!out) return { transcript: text, polished: false };
    return { transcript: out, polished: true, model };
  } catch (err) {
    console.warn('ASR polish error:', err);
    return { transcript: text, polished: false };
  }
}
