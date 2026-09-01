import { blobToBase64, blobsToChunks } from './utils/chunkAudio.ts';
import { transcribeChunk, structureNote } from './api.ts';
import type {
  AdhdToolsState,
  AssistanceDegree,
  DetailLevel,
  EhrContext,
  ReferralOptions,
  ScribeDocument,
  TemplateId,
} from './types.ts';
import { applyAdhdToolsToSections } from './utils/adhdToolsNote.ts';

export async function transcribeBlobs(
  blobs: Blob[],
  mimeType: string,
  onProgress?: (current: number, total: number) => void,
): Promise<string> {
  const chunks = await blobsToChunks(blobs);
  const parts: string[] = [];
  const failed: number[] = [];
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(i + 1, chunks.length);
    // Space chunk calls — free-tier RPM is often ~5–15; ADHD consults have many 6‑min chunks.
    if (i > 0) await new Promise((r) => setTimeout(r, 2500));
    try {
      const b64 = await blobToBase64(chunks[i]);
      const text = await transcribeChunk(b64, chunks[i].type || mimeType);
      if (text.trim()) parts.push(text.trim());
      else failed.push(i + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      // Daily/project quota: stop burning more chunks.
      if (/429|quota exceeded|rate limit/i.test(msg)) throw err;
      // Keep going — one bad chunk must not wipe a long consult.
      failed.push(i + 1);
    }
  }
  if (!parts.length) {
    throw new Error(
      chunks.length > 1
        ? `Transcription failed for all ${chunks.length} audio chunks. Check API key / free-tier quota, then retry Stop & transcribe or Upload.`
        : 'Transcription failed. Check API key / free-tier quota, then retry or Upload.',
    );
  }
  let text = parts.join('\n\n').trim();
  if (failed.length) {
    text += `\n\n[Note: audio chunk(s) ${failed.join(', ')} of ${chunks.length} could not be transcribed — review those minutes manually.]`;
  }
  return text;
}

export function mergeTranscript(prior: string, next: string): string {
  const a = prior.trim();
  const b = next.trim();
  if (a && b) return `${a}\n\n[Resumed audio segment]\n${b}`;
  return b || a;
}

export function assembleNote(opts: {
  id?: string;
  sessionId?: string;
  sessionName: string;
  createdAt?: string;
  templateId: TemplateId;
  assistanceDegree: AssistanceDegree;
  detailLevel: DetailLevel;
  transcript: string;
  patientContext: string;
  ehrContext: EhrContext | null;
  referral?: ReferralOptions | null;
  audioDurationSec: number;
  tools?: AdhdToolsState | null;
  structured: Pick<ScribeDocument, 'title' | 'subtitle' | 'summary' | 'sections' | 'advisories'>;
}): ScribeDocument {
  const now = new Date().toISOString();
  const uid = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const sessionId = opts.sessionId || `sess_${uid()}`;
  const sessionName = opts.sessionName.trim() || 'Untitled session';
  const isAdhd = opts.templateId === 'adhd_multi_session';
  // Keep tools on every session doc (H&P/GPCCMP too) so Adult ADHD can reuse them later.
  const tools = opts.tools || null;
  const sections = isAdhd
    ? applyAdhdToolsToSections(opts.structured.sections || [], tools)
    : opts.structured.sections || [];
  return {
    id: opts.id || `note_${uid()}`,
    sessionId,
    sessionName,
    title: opts.structured.title || sessionName,
    subtitle: opts.structured.subtitle || '',
    summary: opts.structured.summary || '',
    templateId: opts.templateId,
    assistanceDegree: opts.assistanceDegree,
    detailLevel: opts.detailLevel,
    sections,
    advisories: opts.structured.advisories || [],
    transcript: opts.transcript,
    patientContext: opts.patientContext,
    ehrContext: opts.ehrContext,
    referral: opts.referral || null,
    tools,
    createdAt: opts.createdAt || now,
    updatedAt: now,
    audioDurationSec: opts.audioDurationSec,
  };
}

export async function structureFromTranscript(opts: {
  transcript: string;
  templateId: TemplateId;
  assistanceDegree: AssistanceDegree;
  detailLevel: DetailLevel;
  ehrContext: EhrContext | null;
  patientContext: string;
  referral?: ReferralOptions | null;
}): Promise<Pick<ScribeDocument, 'title' | 'subtitle' | 'summary' | 'sections' | 'advisories'>> {
  return structureNote({
    transcript: opts.transcript,
    styleId: opts.templateId,
    assistanceDegree: opts.assistanceDegree,
    detailLevel: opts.detailLevel,
    ehrContext: opts.ehrContext,
    patientContext: opts.patientContext,
    referral: opts.referral,
  });
}
