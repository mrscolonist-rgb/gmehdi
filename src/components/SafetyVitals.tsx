import { ChipToggle } from './ChipToggle.tsx';
import {
  BP_CLASSES,
  HR_CLASSES,
  calcBmi,
  emptySafetyVitals,
  type SafetyVitals,
} from '../data/safetyVitals.ts';

interface Props {
  value: SafetyVitals | null | undefined;
  onChange: (next: SafetyVitals) => void;
}

export function SafetyVitalsFields({ value, onChange }: Props) {
  const v = value || emptySafetyVitals();
  const bmi = calcBmi(v.weightKg, v.heightCm);

  function patch(partial: Partial<SafetyVitals>) {
    onChange({ ...v, ...partial });
  }

  return (
    <div className="space-y-3 rounded-lg border border-stone-100 p-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Baseline vitals &amp; measurements
      </p>
      <label className="block text-[11px] text-stone-600">
        Date
        <input
          type="text"
          value={v.date}
          onChange={(e) => patch({ date: e.target.value })}
          placeholder="DD/MM/YYYY"
          className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
        />
      </label>
      <div>
        <p className="text-[11px] text-stone-600">Blood pressure (mmHg)</p>
        <div className="mt-0.5 flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            value={v.sbp}
            onChange={(e) => patch({ sbp: e.target.value })}
            placeholder="SBP"
            className="w-16 rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
          />
          <span className="text-xs text-stone-400">/</span>
          <input
            type="text"
            inputMode="numeric"
            value={v.dbp}
            onChange={(e) => patch({ dbp: e.target.value })}
            placeholder="DBP"
            className="w-16 rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
          />
        </div>
        <div className="mt-1.5">
          <ChipToggle
            options={BP_CLASSES}
            selected={v.bpClass ? [v.bpClass] : []}
            single
            onToggle={(id) => patch({ bpClass: v.bpClass === id ? '' : id })}
          />
        </div>
      </div>
      <div>
        <p className="text-[11px] text-stone-600">Heart rate (bpm)</p>
        <input
          type="text"
          inputMode="numeric"
          value={v.hr}
          onChange={(e) => patch({ hr: e.target.value })}
          placeholder="bpm"
          className="mt-0.5 w-20 rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
        />
        <div className="mt-1.5">
          <ChipToggle
            options={HR_CLASSES}
            selected={v.hrClass}
            onToggle={(id) =>
              patch({
                hrClass: v.hrClass.includes(id)
                  ? v.hrClass.filter((x) => x !== id)
                  : [...v.hrClass, id],
              })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="text-[11px] text-stone-600">
          Weight (kg)
          <input
            type="text"
            inputMode="decimal"
            value={v.weightKg}
            onChange={(e) => patch({ weightKg: e.target.value })}
            placeholder="kg"
            className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
          />
        </label>
        <label className="text-[11px] text-stone-600">
          Height (cm)
          <input
            type="text"
            inputMode="decimal"
            value={v.heightCm}
            onChange={(e) => patch({ heightCm: e.target.value })}
            placeholder="cm"
            className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
          />
        </label>
        <div className="text-[11px] text-stone-600">
          BMI
          <p className="mt-0.5 rounded-lg border border-stone-100 bg-stone-50 px-2 py-1.5 text-xs text-stone-800">
            {bmi || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
