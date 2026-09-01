import { Router } from 'express';
import { MODELS, STRUCTURE_MODELS, VISION_MODELS } from '../config.ts';
import { hasApiKey } from '../gemini.ts';
import { hasGroqKey } from '../groq.ts';

const router = Router();

router.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: hasApiKey(),
    hasGroqKey: hasGroqKey(),
    models: MODELS,
    structureFallbacks: STRUCTURE_MODELS,
    visionFallbacks: VISION_MODELS,
    timestamp: new Date().toISOString(),
  });
});

export default router;
