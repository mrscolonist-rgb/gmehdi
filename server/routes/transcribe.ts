import { Router } from 'express';
import { MODELS, MAX_CHUNK_BYTES } from '../config.ts';
import { generateText, hasApiKey, inlinePart } from '../gemini.ts';
import { loadPrompt } from '../prompts.ts';

const router = Router();

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

    const transcript = await generateText({
      model: MODELS.transcribe,
      parts: [inlinePart(payload, mimeType), { text: loadPrompt('transcribe.md') }],
    });

    res.json({ success: true, transcript });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Transcription failed';
    console.error('Transcription error:', error);
    res.status(500).json({ error: message });
  }
});

export default router;
