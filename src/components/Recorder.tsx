import { useRef, useState } from 'react';
import { Circle, Pause, Play, Square, Upload } from 'lucide-react';
import { MicRecorder, formatDuration } from '../utils/audio.ts';

interface Props {
  disabled?: boolean;
  onAudio: (blobs: Blob[], mimeType: string, durationSec: number) => void;
}

export function Recorder({ disabled, onAudio }: Props) {
  const rec = useRef<MicRecorder | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [live, setLive] = useState(false);
  const [paused, setPaused] = useState(false);

  async function start() {
    const mic = new MicRecorder(setSeconds);
    rec.current = mic;
    await mic.start();
    setLive(true);
    setPaused(false);
  }

  async function stop() {
    const mic = rec.current;
    if (!mic) return;
    const result = await mic.stop();
    rec.current = null;
    setLive(false);
    setPaused(false);
    setSeconds(0);
    onAudio(result.segments, result.mimeType, result.duration);
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <p className="text-sm font-medium">Consult audio</p>
      <p className="text-xs text-stone-500">Typical 5–20 min; ADHD up to 60 min. Long recordings are split every 6 minutes.</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {!live ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => void start()}
            className="inline-flex items-center gap-1 rounded-lg bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-800 disabled:opacity-50"
          >
            <Circle className="h-3 w-3 fill-current" />
            Record
          </button>
        ) : (
          <>
            <span className="font-mono text-sm">{formatDuration(seconds)}</span>
            <button
              type="button"
              onClick={() => {
                if (paused) rec.current?.resume();
                else rec.current?.pause();
                setPaused(!paused);
              }}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              onClick={() => void stop()}
              className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white"
            >
              <Square className="h-3 w-3 fill-current" />
              Stop &amp; transcribe
            </button>
          </>
        )}
        <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-sm">
          <Upload className="h-4 w-4" />
          Upload
          <input
            type="file"
            accept="audio/*,.webm,.mp3,.m4a,.wav,.ogg"
            className="hidden"
            disabled={disabled || live}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAudio([file], file.type || 'audio/webm', 0);
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}
