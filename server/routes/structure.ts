import { Router } from 'express';
import { MODELS } from '../config.ts';
import { generateJson, hasApiKey } from '../gemini.ts';
import { detailGuidance, loadAssistance, loadStylePrompt, styleIds } from '../prompts.ts';
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
      `${i + 1}. id="${s.id}" title="${s.title}" type=${s.type || 'bullets'}\n   ${s.guidance || ''}`,
  );
  return `REQUIRED SECTIONS (omit a section entirely if it has no stated content, unless the style prompt marks it ALWAYS):\n${lines.join('\n')}`;
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
    } = req.body as {
      transcript?: string;
      styleId?: string;
      assistanceDegree?: string;
      detailLevel?: string;
      sections?: SectionIn[];
      ehrContext?: EhrIn | null;
      patientContext?: string;
    };

    if (!transcript.trim()) {
      return res.status(400).json({ error: 'transcript is required (do not send audio here)' });
    }
    if (!styleIds().includes(styleId)) {
      return res.status(400).json({ error: `Unknown styleId. Use: ${styleIds().join(', ')}` });
    }

    const patientBlock = patientContext.trim()
      ? `CLINICIAN-PASTED PATIENT CONTEXT:\n${patientContext.trim()}\nFuse into the relevant sections. Do not treat this as spoken dialogue.`
      : '';

    const prompt = [
      'You are a medical documentation scribe for Australian general practice.',
      'Output JSON matching the schema. sections[].content is dash-bullet text (-) with Australian spelling.',
      'No markdown cards, tables, emoji, or HTML. No preamble. Advisories never appear inside sections.',
      loadStylePrompt(styleId),
      loadAssistance(assistanceDegree),
      detailGuidance(detailLevel),
      sectionsBlock(sections),
      ehrBlock(ehrContext),
      patientBlock,
      `CONSULTATION TRANSCRIPT:\n---\n${transcript}\n---`,
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
