import type { CriterionFlag } from '../data/dsm5Formulation.ts';

interface Props {
  label: string;
  value: CriterionFlag | null;
  onChange: (v: CriterionFlag | null) => void;
  provisional: boolean;
}

export function CriterionFlagRow({ label, value, onChange, provisional }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-stone-600">{label}</span>
      {(
        [
          ['met', provisional ? 'Leaning met' : 'Met'],
          ['not_met', provisional ? 'Leaning not met' : 'Not met'],
        ] as const
      ).map(([id, text]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(value === id ? null : id)}
          className={`rounded-full border px-2 py-0.5 ${
            value === id
              ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950'
              : 'border-stone-200 text-stone-600'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
