import { TEMPLATES } from '../data/templates.ts';
import type { TemplateId } from '../types.ts';

interface Props {
  value: TemplateId;
  disabled?: boolean;
  onChange: (id: TemplateId) => void;
}

export function TemplatePicker({ value, disabled, onChange }: Props) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">Template</p>
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATES.map((t) => {
          const on = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              title={t.description}
              onClick={() => onChange(t.id)}
              className={`rounded-full border px-2.5 py-1 text-left text-xs transition ${
                on
                  ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
              } ${disabled ? 'opacity-60' : ''}`}
            >
              <span>{t.label}</span>
              <span className="ml-1 font-normal text-stone-500">{t.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
