import { Router } from 'express';
import { MODELS, MAX_CHUNK_BYTES } from '../config.ts';
import { generateText, generateTranscript, hasApiKey, inlinePart } from '../gemini.ts';
import { loadPrompt } from '../prompts.ts';

const router = Router();

/**
 * 1) gemini-3.5-transcribe (Interactions + transcription_config per docs)
 * 2) same model via generateContent audioTranscriptionConfig
 * 3) gemini-3.5-flash + prompts/transcribe.md (free-tier safety net)
 */
async function transcribeWithFallback(
  payload: string,
  mimeType: string,
): Promise<{ transcript: string; model: string; usedFallback: boolean }> {
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
    console.warn('gemini-3.5-transcribe failed; trying Flash fallback:', err);
  }

  const fallback = await generateText({
    model: MODELS.transcribeFallback,
    parts: [inlinePart(payload, mimeType), { text: loadPrompt('transcribe.md') }],
  });
  if (!fallback.trim()) {
    throw new Error(
      'Transcription returned empty text from both gemini-3.5-transcribe and Flash fallback.',
    );
  }
  return {
    transcript: fallback,
    model: MODELS.transcribeFallback,
    usedFallback: true,
  };
}

router.post('/api/transcribe', async (req, res) => {
  try {
    if (!hasApiKey()) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not set' });
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
    const message = error instanceof Error ? error.message : 'Transcription failed';
    console.error('Transcription error:', error);
    res.status(500).json({ error: message });
  }
});

export default router;
