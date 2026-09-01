/**
 * Clinical terms for STT biasing.
 * Gemini 3.5 Transcribe: custom_vocabulary (docs: up to 1000; best ≤100).
 * Groq Whisper: prompt (max ~224 tokens) — keep this list tight.
 */
export const CLINICAL_VOCAB: string[] = [
  'ADHD',
  'ASRS',
  'DSM-5',
  'GPCCMP',
  'methylphenidate',
  'lisdexamfetamine',
  'dexamfetamine',
  'atomoxetine',
  'guanfacine',
  'clonidine',
  'Best Practice',
  'QScript',
  'Medicare',
  'PBS',
  'Ritalin',
  'Concerta',
  'Vyvanse',
  'inattention',
  'hyperactivity',
  'impulsivity',
  'milligrams',
  'micrograms',
  'twice daily',
  'once daily',
];

/**
 * Groq Whisper `prompt` — style/spelling bias only (≤224 tokens).
 * Framing as AU GP medical audio improves drug/term recognition slightly;
 * it does not make Whisper a medical model.
 */
export function groqWhisperPrompt(): string {
  return [
    'Australian general practice medical consultation.',
    'Prefer clinical spellings and brand names:',
    CLINICAL_VOCAB.join(', ') + '.',
  ].join(' ');
}
