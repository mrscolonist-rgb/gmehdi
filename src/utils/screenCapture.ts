import type { EhrContext } from '../types.ts';

export type BpPaneId = 'demographics' | 'currentRx' | 'pastHistory' | 'fullView';

/** Order: clinical panes first — banner alone is not enough for GPCCMP. */
export const BP_PANES: { id: BpPaneId; label: string; hint: string; required?: boolean }[] = [
  {
    id: 'currentRx',
    label: 'Current Rx',
    hint: 'Open Current Rx — every drug line must be visible',
    required: true,
  },
  {
    id: 'pastHistory',
    label: 'Past history',
    hint: 'Open Past history / problem list — every row visible',
    required: true,
  },
  {
    id: 'demographics',
    label: 'Patient banner',
    hint: 'Name, age, UR, allergies in the BP header',
  },
  {
    id: 'fullView',
    label: 'Whole window',
    hint: 'Optional: if banner + Rx + PMHx are all on one screen, grab once',
  },
];

/** Extract needs meds + PMHx panes (or a fullView that includes them). */
export function bpExtractReady(grabs: Partial<Record<BpPaneId, string>>): {
  ok: boolean;
  missing: string[];
} {
  if (grabs.fullView) return { ok: true, missing: [] };
  const missing = BP_PANES.filter((p) => p.required && !grabs[p.id]).map((p) => p.label);
  return { ok: missing.length === 0, missing };
}

export interface BpShare {
  grabFrame: () => Promise<string>;
  stop: () => void;
}

export async function startBpShare(): Promise<BpShare> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Screen capture is not supported in this browser.');
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'window',
      frameRate: { ideal: 5, max: 15 },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  });
  const video = document.createElement('video');
  video.muted = true;
  video.srcObject = stream;
  await video.play();
  await new Promise((r) => {
    if (video.readyState >= 2) r(null);
    else video.onloadeddata = () => r(null);
  });

  function stop() {
    stream.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
  }

  stream.getVideoTracks()[0]?.addEventListener('ended', stop);

  return {
    async grabFrame() {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not capture frame');
      ctx.drawImage(video, 0, 0);
      // Higher quality — dense Current Rx / Past history rows need OCR sharpness.
      return canvas.toDataURL('image/jpeg', 0.92);
    },
    stop,
  };
}

export function ehrSummaryLine(ehr: EhrContext): string {
  const bits = [
    ehr.patientName,
    ehr.ageDob,
    ehr.allergies?.length ? `Allergies: ${ehr.allergies.join(', ')}` : '',
    ehr.currentMedications?.length ? `${ehr.currentMedications.length} meds` : '',
    ehr.pastMedicalHistory?.length ? `${ehr.pastMedicalHistory.length} PMHx` : '',
  ].filter(Boolean);
  return bits.join(' · ') || ehr.rawVisualSummary || 'BP snapshot captured';
}

export function ehrListGroups(ehr: EhrContext): { label: string; items: string[] }[] {
  return [
    { label: 'Allergies', items: ehr.allergies || [] },
    { label: 'Current Rx', items: ehr.currentMedications || [] },
    { label: 'PMHx', items: ehr.pastMedicalHistory || [] },
    { label: 'Vitals', items: ehr.recentVitals || [] },
  ].filter((g) => g.items.length);
}
