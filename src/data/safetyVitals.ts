/** Baseline vitals for pre-treatment safety (ADHD). */

export interface SafetyVitals {
  date: string;
  sbp: string;
  dbp: string;
  bpClass: string;
  hr: string;
  hrClass: string[];
  weightKg: string;
  heightCm: string;
}

export function emptySafetyVitals(): SafetyVitals {
  return {
    date: '',
    sbp: '',
    dbp: '',
    bpClass: '',
    hr: '',
    hrClass: [],
    weightKg: '',
    heightCm: '',
  };
}

export const BP_CLASSES = [
  { id: 'normal', label: 'Normal (<140/90)' },
  { id: 'elevated', label: 'Elevated (130–139 / 85–89) — can initiate with close monitoring' },
  { id: 'hypertension', label: 'Hypertension (≥140/90) — optimize management first' },
];

export const HR_CLASSES = [
  { id: 'normal', label: 'Normal (60–100 bpm)' },
  { id: 'tachy', label: 'Tachycardia (>100 bpm) — investigate before stimulant' },
  { id: 'brady', label: 'Bradycardia (<60 bpm)' },
  { id: 'irregular', label: 'Irregular rhythm — ECG required' },
];

export function calcBmi(weightKg: string, heightCm: string): string {
  const w = Number.parseFloat(weightKg);
  const h = Number.parseFloat(heightCm);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return '';
  const metres = h / 100;
  return (w / (metres * metres)).toFixed(1);
}

export function vitalsHasContent(v: SafetyVitals | null | undefined): boolean {
  if (!v) return false;
  return Boolean(
    v.date.trim() ||
      v.sbp.trim() ||
      v.dbp.trim() ||
      v.bpClass ||
      v.hr.trim() ||
      v.hrClass.length ||
      v.weightKg.trim() ||
      v.heightCm.trim(),
  );
}

function chipLabel(list: { id: string; label: string }[], id: string): string {
  return list.find((c) => c.id === id)?.label || id;
}

export function formatVitalsLines(v: SafetyVitals): string[] {
  if (!vitalsHasContent(v)) return [];
  const lines: string[] = ['Baseline vitals & measurements:'];
  if (v.date.trim()) lines.push(`- Date: ${v.date.trim()}`);
  const bp = [v.sbp.trim(), v.dbp.trim()].filter(Boolean);
  const bpNum = bp.length === 2 ? `${v.sbp.trim()}/${v.dbp.trim()} mmHg` : bp.length ? bp.join(' ') : '';
  const bpClass = v.bpClass ? chipLabel(BP_CLASSES, v.bpClass) : '';
  if (bpNum || bpClass) {
    lines.push(`- BP: ${[bpNum, bpClass].filter(Boolean).join(' — ')}`);
  }
  const hrClass = v.hrClass.map((id) => chipLabel(HR_CLASSES, id)).join('; ');
  if (v.hr.trim() || hrClass) {
    const hrBit = v.hr.trim() ? `${v.hr.trim()} bpm` : '';
    lines.push(`- HR: ${[hrBit, hrClass].filter(Boolean).join(' — ')}`);
  }
  const bmi = calcBmi(v.weightKg, v.heightCm);
  const anth: string[] = [];
  if (v.weightKg.trim()) anth.push(`Weight ${v.weightKg.trim()} kg`);
  if (v.heightCm.trim()) anth.push(`Height ${v.heightCm.trim()} cm`);
  if (bmi) anth.push(`BMI ${bmi}`);
  if (anth.length) lines.push(`- ${anth.join('; ')}`);
  return lines;
}
