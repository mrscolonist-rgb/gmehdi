import type { GenerateContentConfig } from '@google/genai';
import { formatGeminiError, generateJson, generateText, isQuotaError } from './gemini.ts';

function shouldTryNextModel(error: unknown): boolean {
  if (isQuotaError(error)) return true;
  const msg = error instanceof Error ? error.message : String(error || '');
  return /not found|404|not supported|unavailable|unknown model|invalid.*model/i.test(msg);
}

/**
 * Try models in order. Only advances on quota (429) or missing-model errors
 * so we do not silently change clinical output quality for other failures.
 */
export async function generateJsonWithFallback<T>(opts: {
  models: readonly string[];
  parts: object[];
  schema: object;
}): Promise<{ data: T; model: string }> {
  const models = [...new Set(opts.models.map((m) => m.trim()).filter(Boolean))];
  if (!models.length) throw new Error('No models configured for generateJsonWithFallback');

  let lastError: unknown;
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const data = await generateJson<T>({
        model,
        parts: opts.parts,
        schema: opts.schema,
      });
      if (i > 0) console.warn(`generateJson succeeded on fallback model ${model}`);
      return { data, model };
    } catch (err) {
      lastError = err;
      const more = i < models.length - 1;
      if (more && shouldTryNextModel(err)) {
        console.warn(`Model ${model} failed (${isQuotaError(err) ? 'quota' : 'unavailable'}); trying ${models[i + 1]}`);
        continue;
      }
      throw err instanceof Error ? err : new Error(formatGeminiError(err));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(formatGeminiError(lastError));
}

/** Text-only fallback (e.g. STT Flash path) — same 429 / missing-model rules. */
export async function generateTextWithFallback(opts: {
  models: readonly string[];
  parts: object[];
  config?: GenerateContentConfig;
}): Promise<{ text: string; model: string }> {
  const models = [...new Set(opts.models.map((m) => m.trim()).filter(Boolean))];
  if (!models.length) throw new Error('No models configured for generateTextWithFallback');

  let lastError: unknown;
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const text = await generateText({
        model,
        parts: opts.parts,
        config: opts.config,
      });
      return { text, model };
    } catch (err) {
      lastError = err;
      const more = i < models.length - 1;
      if (more && shouldTryNextModel(err)) {
        console.warn(`Model ${model} failed; trying ${models[i + 1]}`);
        continue;
      }
      throw err instanceof Error ? err : new Error(formatGeminiError(err));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(formatGeminiError(lastError));
}
