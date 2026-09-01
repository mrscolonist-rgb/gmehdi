import { Router } from 'express';
import { VISION_MODELS } from '../config.ts';
import { formatGeminiError, hasApiKey, inlinePart, isQuotaError } from '../gemini.ts';
import { generateJsonWithFallback } from '../modelFallback.ts';
import { loadPrompt } from '../prompts.ts';
import { EHR_SCHEMA } from '../schema.ts';

const router = Router();

type FrameIn = { pane?: string; imageBase64?: string; mimeType?: string };

function collectFrames(body: {
  imageBase64?: string;
  mimeType?: string;
  frames?: FrameIn[];
}): { pane: string; imageBase64: string; mimeType: string }[] {
  const fromList = (body.frames || [])
    .filter((f) => Boolean(f.imageBase64))
    .map((f, i) => ({
      pane: (f.pane || `frame${i + 1}`).trim() || `frame${i + 1}`,
      imageBase64: f.imageBase64 as string,
      mimeType: f.mimeType || body.mimeType || 'image/jpeg',
    }));
  if (fromList.length) return fromList.slice(0, 4);
  if (body.imageBase64) {
    return [
      {
        pane: 'fullView',
        imageBase64: body.imageBase64,
        mimeType: body.mimeType || 'image/jpeg',
      },
    ];
  }
  return [];
}

router.post('/api/extract-ehr', async (req, res) => {
  try {
    if (!hasApiKey()) {
      return res.status(503).json({
        error:
          'BP screenshot needs GEMINI_API_KEY (vision). Paste Current Rx / PMHx under Patient context Meds and PMHx if Gemini is down.',
      });
    }
    const frames = collectFrames(req.body as {
      imageBase64?: string;
      mimeType?: string;
      frames?: FrameIn[];
    });
    if (!frames.length) {
      return res.status(400).json({ error: 'imageBase64 or frames[] is required' });
    }

    const parts: object[] = [];
    frames.forEach((f, i) => {
      parts.push({
        text: `Frame ${i + 1} BP pane: ${f.pane}. OCR this still only; merge facts across frames.`,
      });
      parts.push(inlinePart(f.imageBase64, f.mimeType));
    });
    parts.push({ text: loadPrompt('ehr-bp.md') });

    const { data: parsed, model } = await generateJsonWithFallback<Record<string, unknown>>({
      models: VISION_MODELS,
      parts,
      schema: EHR_SCHEMA,
    });

    res.json({
      success: true,
      model,
      ehrContext: {
        ...parsed,
        sourceAppName: 'Best Practice (BP Premier)',
        capturedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = formatGeminiError(error);
    console.error('EHR extraction error:', error);
    const status = isQuotaError(error) || /429|quota/i.test(message)
      ? 429
      : /not set|401|rejected the API key/i.test(message)
        ? 401
        : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
