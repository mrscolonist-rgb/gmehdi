/** Resolve Gemini API key without letting empty .env placeholders win. */
export function resolveApiKey(): string {
  const raw = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  return raw;
}

export function hasApiKey(): boolean {
  return Boolean(resolveApiKey());
}

/** Drop blank env values so AI Studio Secrets can inject a real key. */
export function clearEmptyEnvKeys(keys: string[] = ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'APP_URL']) {
  for (const key of keys) {
    if (process.env[key] !== undefined && !String(process.env[key]).trim()) {
      delete process.env[key];
    }
  }
}

/** Map Google UNAUTHENTICATED / empty-key failures to a clinician-readable message. */
export function formatGeminiError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || 'Gemini request failed');
  const lower = message.toLowerCase();
  if (!resolveApiKey()) {
    return 'GEMINI_API_KEY is not set. In AI Studio: Secrets → GEMINI_API_KEY. Locally: put the key in .env.local and restart.';
  }
  if (
    lower.includes('unauthenticated') ||
    lower.includes('oauth') ||
    lower.includes('401') ||
    lower.includes('api key') ||
    lower.includes('access_token_type') ||
    lower.includes('invalid authentication')
  ) {
    return (
      'Gemini rejected the API key (401). Use a Google AI Studio key from https://aistudio.google.com/apikey ' +
      '(Secret name must be exactly GEMINI_API_KEY). Remove empty GEMINI_API_KEY= from .env.local if Secrets are used, then restart Preview.'
    );
  }
  return message;
}
