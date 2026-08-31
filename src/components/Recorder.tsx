import { useRef, useState } from 'react';
import { Circle, Pause, Play, Square, Upload } from 'lucide-react';
import { MicRecorder, formatDuration } from '../utils/audio.ts';

interface Props {
  disabled?: boolean;
  onAudio: (blobs: Blob[], mimeType: string, durationSec: number) => void;
}

const inIframe = typeof window !== 'undefined' && window.self !== window.top;

export function Recorder({ disabled, onAudio }: Props) {
  const rec = useRef<MicRecorder | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [live, setLive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState('');

  async function start() {
    setError('');
    const mic = new MicRecorder(setSeconds);
    rec.current = mic;
    try {
      await mic.start();
      setLive(true);
      setPaused(false);
    } catch (e) {
      rec.current = null;
      setLive(false);
      setError(e instanceof Error ? e.message : 'Could not start recording.');
    }
  }

  async function stop() {
    const mic = rec.current;
    if (!mic) return;
    setError('');
    try {
      const result = await mic.stop();
      rec.current = null;
      setLive(false);
      setPaused(false);
      setSeconds(0);
      onAudio(result.segments, result.mimeType, result.duration);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not stop recording.');
    }
  }

  return (
    <div className="flex h-full min-h-[148px] flex-col rounded-xl border border-stone-200 bg-white p-3">
      <p className="text-sm font-medium">Consult audio</p>
      <p className="text-xs text-stone-500">
        Typical 5–20 min; ADHD up to 60 min. Split every 6 minutes.
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
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
              if (file) {
                setError('');
                onAudio([file], file.type || 'audio/webm', 0);
              }
              e.target.value = '';
            }}
          />
        </label>
      </div>
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
      {!error && inIframe && !live ? (
        <p className="mt-2 text-xs text-stone-500">
          Preview iframe often blocks the mic — allow when prompted, open Preview in a new tab, or use
          Upload / paste.
        </p>
      ) : null}
    </div>
  );
}
