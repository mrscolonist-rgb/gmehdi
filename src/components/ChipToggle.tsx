interface ChipOption {
  id: string;
  label: string;
}

interface Props {
  options: readonly ChipOption[] | ChipOption[];
  selected: string[];
  onToggle: (id: string) => void;
  single?: boolean;
}

export function ChipToggle({ options, selected, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const on = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={`rounded-full border px-2 py-0.5 text-[11px] ${
              on
                ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950'
                : 'border-stone-200 bg-white text-stone-700'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
