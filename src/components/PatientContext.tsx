interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function PatientContext({ value, onChange }: Props) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-stone-700">Patient context (optional)</span>
      <p className="mb-1 text-xs text-stone-500">Paste PMHx, meds, or prior notes. Fused into the structured note.</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-stone-200 p-2 text-sm"
        placeholder="e.g. T2DM since 2016, metformin 1 g BD, last HbA1c 7.8%"
      />
    </label>
  );
}
