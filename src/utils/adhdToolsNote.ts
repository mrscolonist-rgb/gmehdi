import { mergeAsrsIntoToolsContent } from '../data/asrs.ts';
import { emptyDsm5CriteriaA, mergeDsm5IntoToolsContent } from '../data/dsm5CriteriaA.ts';
import type { AdhdToolsState } from '../types.ts';

/** Sync all ADHD tool score blocks into the Assessment Tools section. */
export function mergeAdhdToolsIntoContent(
  content: string,
  tools: AdhdToolsState | null | undefined,
): string {
  let next = mergeAsrsIntoToolsContent(content, tools?.asrs || {});
  next = mergeDsm5IntoToolsContent(next, tools?.dsm5 || emptyDsm5CriteriaA());
  return next;
}
