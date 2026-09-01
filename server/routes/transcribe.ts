import { Router } from 'express';
import { MODELS, MAX_CHUNK_BYTES } from '../config.ts';
import {
  formatGeminiError,
  generateText,
  generateTranscript,
  hasApiKey,
  inlinePart,
  isQuotaError,
} from '../gemini.ts';
import { hasGroqKey, transcribeWithGroq } from '../groq.ts';
import { polishAsrTranscript } from '../polishTranscript.ts';
import { loadPrompt } from '../prompts.ts';

const router = Router();

/** After Gemini STT 429, skip Gemini for remaining chunks in this process (30 min). */
let geminiSttSkipUntil = 0;

function skipGeminiStt(): boolean {
  return Date.now() < geminiSttSkipUntil;
}

function markGeminiSttQuota(): void {
  geminiSttSkipUntil = Date.now() + 30 * 60 * 1000;
}

async function transcribeViaGroq(
  payload: string,
  mimeType: string,
): Promise<{ transcript: string; model: string; usedFallback: boolean }> {
  const groq = await transcribeWithGroq(payload, mimeType);
  // Whisper is general ASR (~10% WER). Medical prompt + light polish fix
  // spellings only — polish never invents clinical content.
  const polished = await polishAsrTranscript(groq.transcript);
  const model = polished.polished
    ? `${groq.model}+${polished.model || 'polish'}`
    : groq.model;
  return { transcript: polished.transcript, model, usedFallback: true };
}

/**
 * 1) gemini-3.5-transcribe (unless recently 429)
 * 2) Flash + prompts/transcribe.md (only if primary is not a quota error)
 * 3) Groq Whisper — clinic safety net so a Gemini 429 does not wipe the consult
 */
async function transcribeWithFallback(
  payload: string,
  mimeType: string,
): Promise<{ transcript: string; model: string; usedFallback: boolean }> {
  if (hasApiKey() && !skipGeminiStt()) {
    try {
      const primary = await generateTranscript({
        model: MODELS.transcribe,
        audioBase64: payload,
        mimeType,
      });
      if (primary.trim()) {
        return { transcript: primary, model: MODELS.transcribe, usedFallback: false };
      }
      console.warn('gemini-3.5-transcribe returned empty; trying Flash fallback');
    } catch (err) {
      if (isQuotaError(err)) {
        markGeminiSttQuota();
        if (hasGroqKey()) {
          console.warn('Gemini STT quota; failing over to Groq Whisper');
          return transcribeViaGroq(payload, mimeType);
        }
        throw err;
      }
      console.warn('gemini-3.5-transcribe failed; trying Flash fallback:', err);
    }

    try {
      const fallback = await generateText({
        model: MODELS.transcribeFallback,
        parts: [inlinePart(payload, mimeType), { text: loadPrompt('transcribe.md') }],
      });
      if (fallback.trim()) {
        return {
          transcript: fallback,
          model: MODELS.transcribeFallback,
          usedFallback: true,
        };
      }
    } catch (err) {
      if (isQuotaError(err)) {
        markGeminiSttQuota();
        if (hasGroqKey()) return transcribeViaGroq(payload, mimeType);
        throw err;
      }
      console.warn('Flash STT fallback failed:', err);
    }
  }

  if (hasGroqKey()) {
    return transcribeViaGroq(payload, mimeType);
  }

  throw new Error(
    hasApiKey()
      ? 'Transcription failed on Gemini and GROQ_API_KEY is not set.'
      : 'No STT key. Set GEMINI_API_KEY and/or GROQ_API_KEY in .env.local, then restart.',
  );
}

router.post('/api/transcribe', async (req, res) => {
  try {
    if (!hasApiKey() && !hasGroqKey()) {
      return res.status(503).json({
        error:
          'No STT key. Set GEMINI_API_KEY and/or GROQ_API_KEY in .env.local (or AI Studio Secrets), then restart.',
      });
    }
    const { audioBase64, mimeType = 'audio/webm' } = req.body as {
      audioBase64?: string;
      mimeType?: string;
    };
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }
    const payload = audioBase64.includes('base64,')
      ? audioBase64.split('base64,')[1]
      : audioBase64;
    const approxBytes = Math.floor((payload.length * 3) / 4);
    if (approxBytes > MAX_CHUNK_BYTES * 1.2) {
      return res.status(413).json({
        error: `Audio chunk too large (${approxBytes} bytes). Split to ~${MAX_CHUNK_BYTES} bytes.`,
      });
    }

    const result = await transcribeWithFallback(payload, mimeType);
    res.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = formatGeminiError(error);
    console.error('Transcription error:', error);
    const status = isQuotaError(error) || /429|quota/i.test(message)
      ? 429
      : /not set|401|rejected the API key/i.test(message)
        ? 401
        : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
