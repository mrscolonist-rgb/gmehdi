import { structureFromTranscript, assembleNote } from './pipeline.ts';
import { findSessionTools } from './sessions.ts';
import { isReferralTemplate, templateById } from './data/templates.ts';
import type { ScribeDocument, TemplateId } from './types.ts';

export type SiblingResult =
  | { kind: 'referral'; source: ScribeDocument; templateId: TemplateId }
  | { kind: 'note'; note: ScribeDocument };

/** Build GPCCMP / Adult ADHD / H&P from an existing session transcript (referrals → Studio). */
export async function buildSiblingDocument(
  notes: ScribeDocument[],
  source: ScribeDocument,
  templateId: TemplateId,
): Promise<SiblingResult> {
  if (isReferralTemplate(templateId)) {
    return { kind: 'referral', source, templateId };
  }
  const t = templateById(templateId);
  const structured = await structureFromTranscript({
    transcript: source.transcript,
    templateId,
    assistanceDegree: t.defaultAssistance,
    detailLevel: t.defaultDetail,
    ehrContext: source.ehrContext,
    patientContext: source.patientContext,
    referral: null,
  });
  const tools = findSessionTools(notes, source.sessionId) || source.tools || null;
  const note = assembleNote({
    sessionId: source.sessionId,
    sessionName: source.sessionName,
    templateId,
    assistanceDegree: t.defaultAssistance,
    detailLevel: t.defaultDetail,
    transcript: source.transcript,
    patientContext: source.patientContext,
    ehrContext: source.ehrContext,
    referral: null,
    audioDurationSec: source.audioDurationSec,
    tools,
    structured,
  });
  return { kind: 'note', note };
}
