import { BookOpen, Plus, Stethoscope } from 'lucide-react';
import type { HealthStatus } from '../types.ts';

interface Props {
  hasNote: boolean;
  noteCount: number;
  health: HealthStatus | null;
  onNew: () => void;
  onLibrary: () => void;
}

function keyLabel(health: HealthStatus | null): {
  text: string;
  title: string;
  ok: boolean;
} {
  const gemini = Boolean(health?.hasApiKey);
  const groq = Boolean(health?.hasGroqKey);
  if (gemini && groq) {
    return {
      text: 'Gemini + Groq',
      title: 'Gemini for notes/BP; Groq Whisper if Gemini STT quota is exhausted',
      ok: true,
    };
  }
  if (gemini) {
    return {
      text: 'Gemini only',
      title: 'Add GROQ_API_KEY in .env.local so a Gemini 429 does not lose Stop & transcribe',
      ok: true,
    };
  }
  if (groq) {
    return {
      text: 'Groq STT only',
      title: 'Whisper backup is set. BP screenshots still need GEMINI_API_KEY',
      ok: true,
    };
  }
  return {
    text: 'No API keys',
    title: 'Set GEMINI_API_KEY and GROQ_API_KEY in .env.local (or AI Studio Secrets), then restart',
    ok: false,
  };
}

export function Header({ hasNote, noteCount, health, onNew, onLibrary }: Props) {
  const keys = keyLabel(health);
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur no-print">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-emerald-700" />
          <div>
            <p className="text-sm font-semibold tracking-tight">MyScribe</p>
            <p className="text-[11px] text-stone-500">BP progress notes · AU GP</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              keys.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 font-medium text-amber-900'
            }`}
            title={keys.title}
          >
            {keys.text}
          </span>
          <button
            type="button"
            onClick={onLibrary}
            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm hover:bg-stone-50"
          >
            <BookOpen className="h-4 w-4" />
            Library ({noteCount})
          </button>
          {hasNote && (
            <button
              type="button"
              onClick={onNew}
              className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-800"
            >
              <Plus className="h-4 w-4" />
              New session
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
