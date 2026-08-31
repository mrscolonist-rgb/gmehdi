import { blobToBase64, blobsToChunks } from './utils/chunkAudio.ts';
import { transcribeChunk, structureNote } from './api.ts';
import type {
  AssistanceDegree,
  DetailLevel,
  EhrContext,
  ScribeDocument,
  TemplateId,
} from './types.ts';

export async function transcribeBlobs(
  blobs: Blob[],
  mimeType: string,
  onProgress?: (current: number, total: number) => void,
): Promise<string> {
  const chunks = await blobsToChunks(blobs);
  const parts: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(i + 1, chunks.length);
    const b64 = await blobToBase64(chunks[i]);
    const text = await transcribeChunk(b64, chunks[i].type || mimeType);
    if (text) parts.push(text);
  }
  return parts.join('\n\n').trim();
}

export function mergeTranscript(prior: string, next: string): string {
  const a = prior.trim();
  const b = next.trim();
  if (a && b) return `${a}\n\n[Resumed audio segment]\n${b}`;
  return b || a;
}

export function assembleNote(opts: {
  id?: string;
  createdAt?: string;
  templateId: TemplateId;
  assistanceDegree: AssistanceDegree;
  detailLevel: DetailLevel;
  transcript: string;
  patientContext: string;
  ehrContext: EhrContext | null;
  audioDurationSec: number;
  structured: Pick<ScribeDocument, 'title' | 'subtitle' | 'summary' | 'sections' | 'advisories'>;
}): ScribeDocument {
  const now = new Date().toISOString();
  return {
    id: opts.id || `note_${Date.now()}`,
    title: opts.structured.title || 'Untitled note',
    subtitle: opts.structured.subtitle || '',
    summary: opts.structured.summary || '',
    templateId: opts.templateId,
    assistanceDegree: opts.assistanceDegree,
    detailLevel: opts.detailLevel,
    sections: opts.structured.sections || [],
    advisories: opts.structured.advisories || [],
    transcript: opts.transcript,
    patientContext: opts.patientContext,
    ehrContext: opts.ehrContext,
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
}): Promise<Pick<ScribeDocument, 'title' | 'subtitle' | 'summary' | 'sections' | 'advisories'>> {
  return structureNote({
    transcript: opts.transcript,
    styleId: opts.templateId,
    assistanceDegree: opts.assistanceDegree,
    detailLevel: opts.detailLevel,
    ehrContext: opts.ehrContext,
    patientContext: opts.patientContext,
  });
}
