import { useState } from 'react';
import { Check, Copy, Mic } from 'lucide-react';
import type { ScribeDocument } from '../types.ts';
import { copyDashBullet } from '../utils/dashBullet.ts';

interface Props {
  doc: ScribeDocument;
  onChange: (doc: ScribeDocument) => void;
  onResume: () => void;
}

export function NoteEditor({ doc, onChange, onResume }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const ok = await copyDashBullet(doc);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  function patchSection(id: string, content: string) {
    onChange({
      ...doc,
      sections: doc.sections.map((s) => (s.id === id ? { ...s, content } : s)),
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <input
            className="w-full text-xl font-semibold outline-none"
            value={doc.title}
            onChange={(e) => onChange({ ...doc, title: e.target.value })}
          />
          <p className="text-sm text-stone-500">{doc.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"
          >
            <Mic className="h-4 w-4" />
            Resume recording
          </button>
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied for BP' : 'Copy for Best Practice'}
          </button>
        </div>
      </div>
      {doc.summary ? <p className="text-sm text-stone-600">{doc.summary}</p> : null}
      {doc.sections.map((sec) => (
        <section key={sec.id} className="rounded-xl border border-stone-200 bg-white p-3">
          <h2 className="mb-2 text-sm font-semibold">{sec.title}</h2>
          <textarea
            className="w-full resize-y rounded-lg border border-stone-100 p-2 font-mono text-sm"
            rows={Math.max(4, sec.content.split('\n').length + 1)}
            value={sec.content}
            onChange={(e) => patchSection(sec.id, e.target.value)}
          />
        </section>
      ))}
      {doc.advisories?.length ? (
        <aside className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="font-semibold text-amber-900">Clinical advisories (not copied to BP)</p>
          <ul className="mt-2 space-y-2">
            {doc.advisories.map((a) => (
              <li key={a.title}>
                <span className="font-medium">{a.title}: </span>
                {a.body}
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
      <details className="text-sm">
        <summary className="cursor-pointer text-stone-500">Transcript</summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-stone-100 p-3 text-xs">{doc.transcript}</pre>
      </details>
    </div>
  );
}
