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

export const BLACK_SHARE_HINT =
  'This share is a black frame. On Windows, pick Entire screen (the monitor with Best Practice), not Window. Keep Premier visible, not minimised, and not Run as administrator. Window-share of native PMS is often a black GPU surface — BP does not need to block capture for that to happen. Or paste Current Rx / PMHx under Patient context.';

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
  stream: MediaStream;
  grabFrame: () => Promise<string>;
  stop: () => void;
}

function isBlackFrame(source: CanvasImageSource, width: number, height: number): boolean {
  if (width < 8 || height < 8) return true;
  const probe = document.createElement('canvas');
  probe.width = 48;
  probe.height = 27;
  const ctx = probe.getContext('2d');
  if (!ctx) return true;
  ctx.drawImage(source, 0, 0, 48, 27);
  const { data } = ctx.getImageData(0, 0, 48, 27);
  let max = 0;
  for (let i = 0; i < data.length; i += 4) {
    max = Math.max(max, data[i], data[i + 1], data[i + 2]);
    if (max > 24) return false;
  }
  return true;
}

async function waitForVideo(video: HTMLVideoElement): Promise<void> {
  const deadline = Date.now() + 2500;
  while (Date.now() < deadline) {
    if (video.videoWidth > 8 && video.readyState >= 2) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  if (video.videoWidth < 8) {
    throw new Error(
      'Screen share produced no video. In the picker choose Entire screen, then the monitor showing Best Practice.',
    );
  }
}

export async function startBpShare(): Promise<BpShare> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Screen capture is not supported in this browser.');
  }
  // Prefer Entire screen: Chrome window-share of native Win32/GPU apps (BP Premier,
  // Citrix, RDP) is a known black-frame path. Hint only — the picker still lists Window.
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'monitor',
      frameRate: { ideal: 5, max: 15 },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
    preferCurrentTab: false,
    selfBrowserSurface: 'exclude',
    monitorTypeSurfaces: 'include',
    surfaceSwitching: 'include',
  } as DisplayMediaStreamOptions);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  await video.play();
  await waitForVideo(video);

  function stop() {
    stream.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
  }

  stream.getVideoTracks()[0]?.addEventListener('ended', stop);

  return {
    stream,
    async grabFrame() {
      const snap = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not capture frame');
        ctx.drawImage(video, 0, 0);
        return canvas;
      };
      let canvas = snap();
      if (isBlackFrame(canvas, canvas.width, canvas.height)) {
        await new Promise((r) => setTimeout(r, 280));
        canvas = snap();
      }
      if (isBlackFrame(canvas, canvas.width, canvas.height)) {
        throw new Error(BLACK_SHARE_HINT);
      }
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
