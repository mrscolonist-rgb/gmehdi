import { Router } from 'express';
import { Type } from '@google/genai';
import { STRUCTURE_MODELS } from '../config.ts';
import { formatGeminiError, hasApiKey, isQuotaError } from '../gemini.ts';
import { hasGroqKey } from '../groq.ts';
import { generateJsonWithFallback } from '../modelFallback.ts';

const router = Router();

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reasons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        'Distinct referral reasons or continuing conditions the GP explicitly mentioned or implied by a stated referral plan',
    },
    suggestedSpecialty: {
      type: Type.STRING,
      description: 'Best-guess specialty if the GP named one; empty string if unclear',
    },
  },
  required: ['reasons', 'suggestedSpecialty'],
};

router.post('/api/extract-referral-reasons', async (req, res) => {
  try {
    if (!hasApiKey() && !hasGroqKey()) {
      return res.status(503).json({
        error: 'Set GEMINI_API_KEY and/or GROQ_API_KEY in .env.local, then restart.',
      });
    }
    const {
      transcript = '',
      patientContext = '',
      mode = 'new',
    } = req.body as {
      transcript?: string;
      patientContext?: string;
      mode?: 'new' | 'continuing';
    };

    if (!transcript.trim() && !patientContext.trim()) {
      return res.status(400).json({ error: 'transcript or patientContext is required' });
    }

    const continuing = mode === 'continuing';
    const prompt = continuing
      ? `From the GP consultation below, list distinct CONDITIONS that are under ongoing specialist care or that the GP is referring back for continuing specialist management.
Rules:
- Only include conditions the GP explicitly linked to specialist follow-up, review, or ongoing care.
- Use the GP's clinical wording. Short phrases (3–12 words).
- Do not invent conditions. If none, return an empty reasons array.
- If a specialty is named, put it in suggestedSpecialty; else "".

CONSULTATION:
---
${transcript.trim()}
---
${patientContext.trim() ? `ADDITIONAL CONTEXT:\n${patientContext.trim()}` : ''}`
      : `From the GP consultation below, list distinct REASONS FOR REFERRAL that the GP mentioned or clearly planned (e.g. "refer to cardiology for AF opinion", "ENT for recurrent sinusitis").
Rules:
- Extract only referral intents / clinical questions the GP stated for a specialist.
- Each reason should be a short phrase the GP could select (3–15 words).
- Prefer the GP's wording. Do not invent referrals not stated.
- If multiple problems were referred, list each separately.
- If none, return an empty reasons array.
- If a specialty is named for a reason, you may still list the clinical reason in reasons; put the specialty name in suggestedSpecialty if one dominant specialty is clear, else "".

CONSULTATION:
---
${transcript.trim()}
---
${patientContext.trim() ? `ADDITIONAL CONTEXT:\n${patientContext.trim()}` : ''}`;

    const { data, model } = await generateJsonWithFallback<{
      reasons: string[];
      suggestedSpecialty: string;
    }>({
      models: STRUCTURE_MODELS,
      parts: [{ text: prompt }],
      schema: SCHEMA,
    });

    const reasons = (data.reasons || [])
      .map((r) => (r || '').trim())
      .filter(Boolean)
      .slice(0, 12);

    res.json({
      success: true,
      model,
      reasons,
      suggestedSpecialty: (data.suggestedSpecialty || '').trim(),
    });
  } catch (error: unknown) {
    const message = formatGeminiError(error);
    console.error('extract-referral-reasons error:', error);
    const status = isQuotaError(error) || /429|quota/i.test(message)
      ? 429
      : /not set|401|rejected the API key/i.test(message)
        ? 401
        : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
