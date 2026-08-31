import { Router } from 'express';
import { MODELS } from '../config.ts';
import { formatGeminiError, generateJson, hasApiKey, inlinePart } from '../gemini.ts';
import { loadPrompt } from '../prompts.ts';
import { EHR_SCHEMA } from '../schema.ts';

const router = Router();

router.post('/api/extract-ehr', async (req, res) => {
  try {
    if (!hasApiKey()) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not set' });
    }
    const { imageBase64, mimeType = 'image/jpeg' } = req.body as {
      imageBase64?: string;
      mimeType?: string;
    };
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const parsed = await generateJson<Record<string, unknown>>({
      model: MODELS.vision,
      parts: [
        inlinePart(imageBase64, mimeType),
        { text: loadPrompt('ehr-bp.md') },
      ],
      schema: EHR_SCHEMA,
    });

    res.json({
      success: true,
      ehrContext: {
        ...parsed,
        sourceAppName: 'Best Practice (BP Premier)',
        capturedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = formatGeminiError(error);
    console.error('EHR extraction error:', error);
    const status = /not set|401|rejected the API key/i.test(message) ? 401 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
