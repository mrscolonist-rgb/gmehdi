import { mergeAsrsIntoToolsContent } from '../data/asrs.ts';
import {
  differentialHasContent,
  emptyDifferential,
  mergeDifferentialIntoContent,
} from '../data/differential.ts';
import {
  emptyDsm5CriteriaA,
  mergeDsm5IntoContent,
  scoreDsm5CriteriaA,
  stripDsm5FromContent,
} from '../data/dsm5CriteriaA.ts';
import {
  emptyDsm5Formulation,
  formulationHasContent,
  mergeFormulationIntoContent,
} from '../data/dsm5Formulation.ts';
import {
  educationHasContent,
  emptyEducation,
  mergeEducationIntoContent,
} from '../data/education.ts';
import { emptySafety, mergeSafetyIntoContent, safetyHasContent } from '../data/safety.ts';
import type { AdhdToolsState, DocumentSection } from '../types.ts';

export function adhdToolsHasContent(tools: AdhdToolsState | null | undefined): boolean {
  if (!tools) return false;
  if (Object.keys(tools.asrs || {}).length > 0) return true;
  if (scoreDsm5CriteriaA(tools.dsm5 || emptyDsm5CriteriaA()).anyChecked) return true;
  if (formulationHasContent(tools.formulation || emptyDsm5Formulation())) return true;
  if (differentialHasContent(tools.differential || emptyDifferential())) return true;
  if (educationHasContent(tools.education || emptyEducation())) return true;
  if (safetyHasContent(tools.safety || emptySafety())) return true;
  return false;
}

/** Sync interactive tool blocks into Assessment Tools + Diagnostic Impression. */
export function applyAdhdToolsToSections(
  sections: DocumentSection[],
  tools: AdhdToolsState | null | undefined,
): DocumentSection[] {
  if (!tools || !adhdToolsHasContent(tools)) return sections;
  return sections.map((s) => {
    if (s.id === 'sec_adhd_tools') {
      const withAsrs = mergeAdhdToolsIntoContent(s.content, tools);
      return { ...s, content: mergeAdhdFormulationIntoTools(withAsrs, tools) };
    }
    if (s.id === 'sec_adhd_diagnosis_plan') {
      return { ...s, content: mergeAdhdFormulationIntoDiagnosis(s.content, tools) };
    }
    return s;
  });
}

/** ASRS item-level answers into Assessment Tools. Criteria A does not belong here. */
export function mergeAdhdToolsIntoContent(
  content: string,
  tools: AdhdToolsState | null | undefined,
): string {
  let next = stripDsm5FromContent(content);
  next = mergeAsrsIntoToolsContent(next, tools?.asrs || {});
  return next;
}

export function mergeAdhdFormulationIntoDiagnosis(
  content: string,
  tools: AdhdToolsState | null | undefined,
): string {
  let next = mergeDsm5IntoContent(content, tools?.dsm5 || emptyDsm5CriteriaA());
  next = mergeFormulationIntoContent(
    next,
    tools?.formulation || emptyDsm5Formulation(),
  );
  next = mergeDifferentialIntoContent(next, tools?.differential || emptyDifferential());
  next = mergeEducationIntoContent(next, tools?.education || emptyEducation());
  next = mergeSafetyIntoContent(next, tools?.safety || emptySafety());
  return next;
}

export function mergeAdhdFormulationIntoTools(
  content: string,
  tools: AdhdToolsState | null | undefined,
): string {
  let next = stripDsm5FromContent(content);
  next = mergeFormulationIntoContent(
    next,
    tools?.formulation || emptyDsm5Formulation(),
  );
  next = mergeDifferentialIntoContent(next, tools?.differential || emptyDifferential());
  next = mergeEducationIntoContent(next, tools?.education || emptyEducation());
  next = mergeSafetyIntoContent(next, tools?.safety || emptySafety());
  return next;
}
