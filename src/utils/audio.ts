import { CHUNK_DURATION_MS } from './chunkAudio.ts';

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

function pickMime(): string {
  for (const mime of MIME_CANDIDATES) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return '';
}

function micErrorMessage(err: unknown): string {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Microphone blocked. Allow the mic for this site (or open Preview in a new tab), or use Upload / paste.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No microphone found. Plug one in, or use Upload / paste.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'Microphone is in use by another app. Close it, or use Upload / paste.';
  }
  if (err instanceof Error && err.message) return err.message;
  return 'Could not start the microphone. Try Upload or paste a transcript.';
}

/** Prefer processing constraints; fall back to plain audio if the device rejects them. */
async function openMicStream(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (first) {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (second) {
      throw new Error(micErrorMessage(second || first));
    }
  }
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Mic recorder that rotates a complete MediaRecorder blob every 6 minutes. */
export class MicRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private pieces: Blob[] = [];
  private segments: Blob[] = [];
  private mime = '';
  private tick: number | null = null;
  private rotating = false;
  duration = 0;
  isRecording = false;
  isPaused = false;

  constructor(private onTick?: (seconds: number) => void) {}

  async start(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'Microphone API unavailable in this browser. Use Upload or paste a transcript.',
      );
    }
    this.segments = [];
    this.duration = 0;
    this.mime = pickMime();
    this.stream = await openMicStream();
    this.isRecording = true;
    this.isPaused = false;
    this.beginRecorder();
    this.tick = window.setInterval(() => {
      if (this.isPaused) return;
      this.duration += 1;
      this.onTick?.(this.duration);
      const chunkSec = Math.floor(CHUNK_DURATION_MS / 1000);
      if (this.duration > 0 && this.duration % chunkSec === 0) void this.rotateSegment();
    }, 1000);
  }

  private beginRecorder(): void {
    if (!this.stream) return;
    this.pieces = [];
    this.recorder = this.mime
      ? new MediaRecorder(this.stream, { mimeType: this.mime })
      : new MediaRecorder(this.stream);
    this.mime = this.recorder.mimeType || this.mime || 'audio/webm';
    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.pieces.push(e.data);
    };
    this.recorder.start(1000);
  }

  private flush(): Promise<Blob> {
    return new Promise((resolve) => {
      const rec = this.recorder;
      if (!rec || rec.state === 'inactive') {
        resolve(new Blob(this.pieces, { type: this.mime || 'audio/webm' }));
        return;
      }
      rec.onstop = () => resolve(new Blob(this.pieces, { type: this.mime || 'audio/webm' }));
      rec.stop();
    });
  }

  private async rotateSegment(): Promise<void> {
    if (this.rotating || !this.isRecording) return;
    this.rotating = true;
    try {
      const blob = await this.flush();
      if (blob.size > 0) this.segments.push(blob);
      if (this.isRecording) this.beginRecorder();
    } finally {
      this.rotating = false;
    }
  }

  pause(): void {
    if (this.recorder?.state === 'recording') {
      this.recorder.pause();
      this.isPaused = true;
    }
  }

  resume(): void {
    if (this.recorder?.state === 'paused') {
      this.recorder.resume();
      this.isPaused = false;
    }
  }

  async stop(): Promise<{ segments: Blob[]; mimeType: string; duration: number }> {
    this.isRecording = false;
    if (this.tick) window.clearInterval(this.tick);
    while (this.rotating) await new Promise((r) => setTimeout(r, 40));
    const last = await this.flush();
    if (last.size > 0) this.segments.push(last);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
    return { segments: this.segments, mimeType: this.mime || 'audio/webm', duration: this.duration };
  }
}
