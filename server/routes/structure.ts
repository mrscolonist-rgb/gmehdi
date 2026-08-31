import { Router } from 'express';
import { MODELS } from '../config.ts';
import { generateJson, hasApiKey } from '../gemini.ts';
import {
  detailGuidance,
  isReferralStyle,
  loadAssistance,
  loadStylePrompt,
  styleIds,
} from '../prompts.ts';
import { NOTE_SCHEMA } from '../schema.ts';

type SectionIn = { id: string; title: string; type?: string; guidance?: string };
type EhrIn = {
  patientName?: string;
  ageDob?: string;
  gender?: string;
  allergies?: string[];
  currentMedications?: string[];
  pastMedicalHistory?: string[];
  recentVitals?: string[];
  recentInvestigations?: string[];
  currentDiagnosisOrReason?: string;
  rawVisualSummary?: string;
};
type ReferralIn = {
  specialty?: string;
  referralReason?: string;
  continuingCondition?: string;
  outputType?: string;
  brevityLevel?: string;
};

const router = Router();

function ehrBlock(ehr?: EhrIn | null): string {
  if (!ehr) return '';
  return `PATIENT EHR (Best Practice snapshot — fuse with spoken consult; do not invent unstated exams or decisions):
- Patient: ${ehr.patientName || 'Not specified'} ${ehr.ageDob || ''} ${ehr.gender || ''}
- Allergies: ${ehr.allergies?.join(', ') || 'None visible'}
- Active medications: ${ehr.currentMedications?.join('; ') || 'None visible'}
- Past history: ${ehr.pastMedicalHistory?.join('; ') || 'None visible'}
- Vitals: ${ehr.recentVitals?.join('; ') || 'None visible'}
- Investigations: ${ehr.recentInvestigations?.join('; ') || 'None visible'}
- Reason / context: ${ehr.currentDiagnosisOrReason || ehr.rawVisualSummary || ''}`;
}

function sectionsBlock(sections?: SectionIn[]): string {
  if (!sections?.length) return '';
  const lines = sections.map(
    (s, i) =>
      `${i + 1}. id="${s.id}" title="${s.title}" type=${s.type || 'text'}\n   ${s.guidance || ''}`,
  );
  return `REQUIRED SECTIONS (omit a section entirely if it has no stated content, unless the style prompt marks it ALWAYS):\n${lines.join('\n')}`;
}

function referralBlock(styleId: string, referral?: ReferralIn | null): string {
  if (!isReferralStyle(styleId) || !referral) return '';
  const outputType = referral.outputType === 'body_only' ? 'body_only' : 'full_letter';
  const brevity = referral.brevityLevel === 'brief' ? 'brief' : 'standard';
  if (styleId === 'referral_continuing') {
    return `REFERRAL INPUT PARAMETERS:
- specialty: ${referral.specialty || ''}
- continuing_condition: ${referral.continuingCondition || ''}
- output_type: ${outputType}
- brevity_level: ${brevity}
- consultation_note: the transcript (and EHR / patient context blocks) below
- context: the clinician-pasted patient context block below (if any)

SCOPE: Include ONLY content related to continuing_condition for this specialty. Omit unrelated consult content.`;
  }
  return `REFERRAL INPUT PARAMETERS:
- specialty: ${referral.specialty || ''}
- referral_reason: ${referral.referralReason || ''}
- output_type: ${outputType}
- consultation_note: the transcript (and EHR / patient context blocks) below
- context: the clinician-pasted patient context block below (if any)

SCOPE: Include ONLY content related to referral_reason for this specialty. Omit unrelated consult content.`;
}

router.post('/api/structure', async (req, res) => {
  try {
    if (!hasApiKey()) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not set' });
    }
    const {
      transcript = '',
      styleId = 'hp_brief',
      assistanceDegree = 'pure_scribe',
      detailLevel = 'standard',
      sections = [],
      ehrContext = null,
      patientContext = '',
      referral = null,
    } = req.body as {
      transcript?: string;
      styleId?: string;
      assistanceDegree?: string;
      detailLevel?: string;
      sections?: SectionIn[];
      ehrContext?: EhrIn | null;
      patientContext?: string;
      referral?: ReferralIn | null;
    };

    if (!transcript.trim()) {
      return res.status(400).json({ error: 'transcript is required (do not send audio here)' });
    }
    if (!styleIds().includes(styleId)) {
      return res.status(400).json({ error: `Unknown styleId. Use: ${styleIds().join(', ')}` });
    }
    if (isReferralStyle(styleId)) {
      if (!referral?.specialty?.trim()) {
        return res.status(400).json({ error: 'Referral specialty is required' });
      }
      if (styleId === 'referral_new' && !referral.referralReason?.trim()) {
        return res.status(400).json({ error: 'Referral reason is required' });
      }
      if (styleId === 'referral_continuing' && !referral.continuingCondition?.trim()) {
        return res.status(400).json({ error: 'Continuing condition is required' });
      }
    }

    const patientBlock = patientContext.trim()
      ? `CLINICIAN-PASTED PATIENT CONTEXT / <context>:\n${patientContext.trim()}\nWhen this conflicts with the transcript, this context overrides.`
      : '';

    const letter = isReferralStyle(styleId);
    const prompt = [
      letter
        ? 'You are generating an Australian GP medical referral letter. Output JSON matching the schema. sections[].content is letter prose (paragraphs). No dash-bullet clinical note format unless a short list is clinically clearer.'
        : 'You are a medical documentation scribe for Australian general practice. Output JSON matching the schema. sections[].content is dash-bullet text (-) with Australian spelling.',
      'No markdown cards, tables, emoji, or HTML. No preamble. Advisories never appear inside sections.',
      loadStylePrompt(styleId),
      loadAssistance(assistanceDegree),
      letter ? '' : detailGuidance(detailLevel),
      referralBlock(styleId, referral),
      sectionsBlock(sections),
      ehrBlock(ehrContext),
      patientBlock,
      `CONSULTATION TRANSCRIPT / consultation_note:\n---\n${transcript}\n---`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const data = await generateJson({
      model: MODELS.structure,
      parts: [{ text: prompt }],
      schema: NOTE_SCHEMA,
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Structuring failed';
    console.error('Structuring error:', error);
    res.status(500).json({ error: message });
  }
});

export default router;
