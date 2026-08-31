import { RotateCcw } from 'lucide-react';
import type { AsrsAnswers } from '../data/asrs.ts';
import {
  differentialHasContent,
  emptyDifferential,
} from '../data/differential.ts';
import { emptyDsm5CriteriaA, scoreDsm5CriteriaA } from '../data/dsm5CriteriaA.ts';
import {
  emptyDsm5Formulation,
  formulationHasContent,
} from '../data/dsm5Formulation.ts';
import { educationHasContent, emptyEducation } from '../data/education.ts';
import { emptySafety, safetyHasContent } from '../data/safety.ts';
import type { AdhdToolsState } from '../types.ts';
import { AsrsTool } from './AsrsTool.tsx';
import { DifferentialConditions } from './DifferentialConditions.tsx';
import { Dsm5Formulation } from './Dsm5Formulation.tsx';
import { Dsm5SymptomChecklist } from './Dsm5SymptomChecklist.tsx';
import { PatientEducation } from './PatientEducation.tsx';
import { SafetyAssessment } from './SafetyAssessment.tsx';

interface Props {
  value: AdhdToolsState | null | undefined;
  onChange: (next: AdhdToolsState) => void;
}

export function AdhdTools({ value, onChange }: Props) {
  const asrs: AsrsAnswers = value?.asrs || {};
  const dsm5 = value?.dsm5 || emptyDsm5CriteriaA();
  const formulation = value?.formulation || emptyDsm5Formulation();
  const differential = value?.differential || emptyDifferential();
  const education = value?.education || emptyEducation();
  const safety = value?.safety || emptySafety();
  const hasAsrs = Object.keys(asrs).length > 0;
  const hasDsm5 = scoreDsm5CriteriaA(dsm5).anyChecked;
  const hasForm = formulationHasContent(formulation);
  const hasDiff = differentialHasContent(differential);
  const hasEdu = educationHasContent(education);
  const hasSafety = safetyHasContent(safety);
  const hasAny = hasAsrs || hasDsm5 || hasForm || hasDiff || hasEdu || hasSafety;

  return (
    <section className="space-y-3 rounded-xl border border-emerald-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">ADHD assessment tools</h2>
          <p className="text-[11px] text-stone-500">
            Optional. Use only what you need this session — nothing here is required. ASRS answers
            sync item-by-item into Assessment Tools. The symptom checklist is Criterion A and syncs
            into Diagnostic Impression. Formulation stays in progress until you mark the final
            diagnostic session.
          </p>
        </div>
        {hasAny ? (
          <button
            type="button"
            onClick={() =>
              onChange({
                asrs: {},
                dsm5: emptyDsm5CriteriaA(),
                formulation: emptyDsm5Formulation(),
                differential: emptyDifferential(),
                education: emptyEducation(),
                safety: emptySafety(),
              })
            }
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"
          >
            <RotateCcw className="h-3 w-3" />
            Clear tools
          </button>
        ) : null}
      </div>
      <AsrsTool answers={asrs} onChange={(next) => onChange({ ...value, asrs: next })} />
      <Dsm5SymptomChecklist
        value={dsm5}
        onChange={(next) => onChange({ ...value, dsm5: next })}
      />
      <Dsm5Formulation
        value={formulation}
        onChange={(next) => onChange({ ...value, formulation: next })}
      />
      <DifferentialConditions
        value={differential}
        onChange={(next) => onChange({ ...value, differential: next })}
      />
      <PatientEducation
        value={education}
        onChange={(next) => onChange({ ...value, education: next })}
      />
      <SafetyAssessment
        value={safety}
        onChange={(next) => onChange({ ...value, safety: next })}
      />
    </section>
  );
}
