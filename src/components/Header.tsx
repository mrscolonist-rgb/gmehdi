import { BookOpen, Plus, Stethoscope } from 'lucide-react';
import type { HealthStatus } from '../types.ts';

interface Props {
  hasNote: boolean;
  noteCount: number;
  health: HealthStatus | null;
  onNew: () => void;
  onLibrary: () => void;
}

export function Header({ hasNote, noteCount, health, onNew, onLibrary }: Props) {
  const keyOk = health?.hasApiKey;
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
            className={`hidden rounded-full px-2 py-0.5 text-[11px] sm:inline ${
              keyOk ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {keyOk ? 'Gemini key set' : 'No GEMINI_API_KEY'}
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
