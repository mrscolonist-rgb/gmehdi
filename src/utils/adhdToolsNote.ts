import { mergeAsrsIntoToolsContent } from '../data/asrs.ts';
import {
  emptyDifferential,
  mergeDifferentialIntoContent,
} from '../data/differential.ts';
import { emptyDsm5CriteriaA, mergeDsm5IntoToolsContent } from '../data/dsm5CriteriaA.ts';
import {
  emptyDsm5Formulation,
  mergeFormulationIntoContent,
} from '../data/dsm5Formulation.ts';
import type { AdhdToolsState } from '../types.ts';

/** Sync ASRS + Criteria A into Assessment Tools. */
export function mergeAdhdToolsIntoContent(
  content: string,
  tools: AdhdToolsState | null | undefined,
): string {
  let next = mergeAsrsIntoToolsContent(content, tools?.asrs || {});
  next = mergeDsm5IntoToolsContent(next, tools?.dsm5 || emptyDsm5CriteriaA());
  return next;
}

export function mergeAdhdFormulationIntoDiagnosis(
  content: string,
  tools: AdhdToolsState | null | undefined,
): string {
  let next = mergeFormulationIntoContent(
    content,
    tools?.formulation || emptyDsm5Formulation(),
  );
  next = mergeDifferentialIntoContent(next, tools?.differential || emptyDifferential());
  return next;
}

export function mergeAdhdFormulationIntoTools(
  content: string,
  tools: AdhdToolsState | null | undefined,
): string {
  let next = mergeFormulationIntoContent(
    content,
    tools?.formulation || emptyDsm5Formulation(),
  );
  next = mergeDifferentialIntoContent(next, tools?.differential || emptyDifferential());
  return next;
}
