import type { ScribeDocument } from '../types.ts';
import { adhdToolsHasContent } from '../utils/adhdToolsNote.ts';
import { ehrSummaryLine } from '../utils/screenCapture.ts';

/** Saved consult inputs for this session only — reusable when adding sibling docs. */
export function SessionSources({ doc }: { doc: ScribeDocument }) {
  const hasCtx = Boolean(doc.patientContext?.trim());
  const hasEhr = Boolean(doc.ehrContext);
  const hasTools = adhdToolsHasContent(doc.tools);
  return (
    <details className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 text-sm">
      <summary className="cursor-pointer font-medium text-stone-700">
        Session sources (this consult only)
      </summary>
      <p className="mt-1 text-[11px] text-stone-500">
        Transcript, patient context, BP capture, and ADHD tools are stored with this session and
        never mixed into other consults.
      </p>
      <div className="mt-2 space-y-3">
        <div>
          <p className="text-xs font-semibold text-stone-600">Transcript</p>
          <pre className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-white p-2 font-mono text-xs text-stone-800">
            {doc.transcript?.trim() || '—'}
          </pre>
        </div>
        {hasCtx ? (
          <div>
            <p className="text-xs font-semibold text-stone-600">Patient context</p>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-2 font-mono text-xs">
              {doc.patientContext}
            </pre>
          </div>
        ) : null}
        {hasEhr && doc.ehrContext ? (
          <div>
            <p className="text-xs font-semibold text-stone-600">Best Practice capture</p>
            <p className="mt-1 text-xs text-emerald-900">{ehrSummaryLine(doc.ehrContext)}</p>
          </div>
        ) : null}
        {hasTools ? (
          <p className="text-xs text-emerald-900">ADHD tools saved on this session (open panel to edit).</p>
        ) : null}
      </div>
    </details>
  );
}
