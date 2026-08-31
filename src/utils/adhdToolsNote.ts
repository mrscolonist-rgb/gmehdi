import { mergeAsrsIntoToolsContent } from '../data/asrs.ts';
import {
  emptyDifferential,
  mergeDifferentialIntoContent,
} from '../data/differential.ts';
import { emptyDsm5CriteriaA, mergeDsm5IntoContent, stripDsm5FromContent } from '../data/dsm5CriteriaA.ts';
import {
  emptyDsm5Formulation,
  mergeFormulationIntoContent,
} from '../data/dsm5Formulation.ts';
import { emptyEducation, mergeEducationIntoContent } from '../data/education.ts';
import { emptySafety, mergeSafetyIntoContent } from '../data/safety.ts';
import type { AdhdToolsState } from '../types.ts';

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
