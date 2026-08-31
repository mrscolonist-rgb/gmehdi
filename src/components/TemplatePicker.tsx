import { TEMPLATES } from '../data/templates.ts';
import type { TemplateId } from '../types.ts';

interface Props {
  value: TemplateId;
  disabled?: boolean;
  onChange: (id: TemplateId) => void;
}

export function TemplatePicker({ value, disabled, onChange }: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {TEMPLATES.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(t.id)}
            className={`rounded-xl border p-3 text-left text-sm transition ${
              on
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-stone-200 bg-white hover:border-stone-300'
            } ${disabled ? 'opacity-60' : ''}`}
          >
            <p className="font-semibold">{t.label}</p>
            <p className="text-xs text-stone-500">{t.shortLabel}</p>
            <p className="mt-1 text-xs text-stone-600">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
