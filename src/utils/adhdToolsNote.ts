import { mergeAsrsIntoToolsContent } from '../data/asrs.ts';
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

/** Sync B–E formulation into Diagnostic Impression (and optionally Tools). */
export function mergeAdhdFormulationIntoDiagnosis(
  content: string,
  tools: AdhdToolsState | null | undefined,
): string {
  return mergeFormulationIntoContent(content, tools?.formulation || emptyDsm5Formulation());
}

/** Also keep a copy of the formulation block in Tools for BP paste completeness. */
export function mergeAdhdFormulationIntoTools(
  content: string,
  tools: AdhdToolsState | null | undefined,
): string {
  return mergeFormulationIntoContent(content, tools?.formulation || emptyDsm5Formulation());
}
