import { useState } from 'react';
import {
  CONTEXT_SECTIONS,
  filledSectionCount,
  formatPatientContext,
  parsePatientContext,
  type ContextSectionId,
} from '../patientContext.ts';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function PatientContext({ value, onChange }: Props) {
  const fields = parsePatientContext(value);
  const filled = filledSectionCount(fields);
  const [open, setOpen] = useState<ContextSectionId | null>(null);
  const active = CONTEXT_SECTIONS.find((s) => s.id === open) || null;

  function patch(id: ContextSectionId, text: string) {
    onChange(formatPatientContext({ ...fields, [id]: text }));
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-stone-700">Patient context (optional)</span>
        {filled > 0 ? (
          <button
            type="button"
            className="text-xs text-stone-500 hover:text-stone-800"
            onClick={() => {
              setOpen(null);
              onChange('');
            }}
          >
            Clear all
          </button>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {CONTEXT_SECTIONS.map((s) => {
          const on = open === s.id;
          const has = Boolean(fields[s.id].trim());
          return (
            <button
              key={s.id}
              type="button"
              title={s.hint}
              aria-expanded={on}
              onClick={() => setOpen(on ? null : s.id)}
              className={`rounded-full border px-2 py-0.5 text-xs ${
                on
                  ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950'
                  : has
                    ? 'border-amber-300 bg-amber-50 text-amber-950'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
              }`}
            >
              {s.label}
              {has ? <span className="ml-1 text-[10px] text-stone-500">●</span> : null}
            </button>
          );
        })}
      </div>
      {active ? (
        <label className="mt-2 block">
          <span className="mb-1 block text-xs text-stone-500">{active.hint}</span>
          <textarea
            value={fields[active.id]}
            onChange={(e) => patch(active.id, e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-stone-200 p-2 font-mono text-xs"
            placeholder={active.placeholder}
          />
        </label>
      ) : (
        <p className="mt-2 text-xs text-stone-500">
          Open a section to paste. Last session is comparison / follow-up only — prior vitals stay
          out of today's note.
        </p>
      )}
    </div>
  );
}
