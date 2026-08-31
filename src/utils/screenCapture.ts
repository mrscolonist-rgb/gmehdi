import type { EhrContext } from '../types.ts';

export async function captureBpWindow(): Promise<string> {
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
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.srcObject = stream;
    await video.play();
    await new Promise((r) => {
      if (video.readyState >= 2) r(null);
      else video.onloadeddata = () => r(null);
    });
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not capture frame');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}

export function ehrSummaryLine(ehr: EhrContext): string {
  const bits = [
    ehr.patientName,
    ehr.ageDob,
    ehr.allergies?.length ? `Allergies: ${ehr.allergies.join(', ')}` : '',
  ].filter(Boolean);
  return bits.join(' · ') || ehr.rawVisualSummary || 'BP snapshot captured';
}
