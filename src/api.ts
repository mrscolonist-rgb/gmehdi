import type {
  HealthStatus,
  ScribeDocument,
  TemplateId,
  AssistanceDegree,
  DetailLevel,
  EhrContext,
  ReferralOptions,
} from './types.ts';
import { templateById } from './data/templates.ts';

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch('/api/health');
  return parseJson<HealthStatus>(res);
}

export async function transcribeChunk(audioBase64: string, mimeType: string): Promise<string> {
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  });
  const data = await parseJson<{ transcript: string }>(res);
  return data.transcript || '';
}

export async function structureNote(input: {
  transcript: string;
  styleId: TemplateId;
  assistanceDegree: AssistanceDegree;
  detailLevel: DetailLevel;
  ehrContext: EhrContext | null;
  patientContext: string;
  referral?: ReferralOptions | null;
}): Promise<Pick<ScribeDocument, 'title' | 'subtitle' | 'summary' | 'sections' | 'advisories'>> {
  const tmpl = templateById(input.styleId);
  const res = await fetch('/api/structure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript: input.transcript,
      styleId: input.styleId,
      assistanceDegree: input.assistanceDegree,
      detailLevel: input.detailLevel,
      ehrContext: input.ehrContext,
      patientContext: input.patientContext,
      referral: input.referral || null,
      sections: tmpl.sections,
    }),
  });
  const data = await parseJson<{
    data: Pick<ScribeDocument, 'title' | 'subtitle' | 'summary' | 'sections' | 'advisories'>;
  }>(res);
  return data.data;
}

export async function extractEhr(imageBase64: string, mimeType = 'image/jpeg'): Promise<EhrContext> {
  const res = await fetch('/api/extract-ehr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  const data = await parseJson<{ ehrContext: EhrContext }>(res);
  return data.ehrContext;
}
