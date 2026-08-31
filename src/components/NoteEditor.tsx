import { Fragment, useState } from 'react';
import { Check, Copy, FilePlus2, Mic } from 'lucide-react';
import type { AdhdToolsState, ScribeDocument, TemplateId } from '../types.ts';
import { TEMPLATES, isReferralTemplate, templateById } from '../data/templates.ts';
import { mergeAsrsIntoToolsContent } from '../data/asrs.ts';
import { copyDashBullet } from '../utils/dashBullet.ts';
import { AdhdTools } from './AdhdTools.tsx';

interface Props {
  doc: ScribeDocument;
  siblingTemplateIds: TemplateId[];
  onChange: (doc: ScribeDocument) => void;
  onRenameSession: (sessionName: string) => void;
  onResume: () => void;
  onGenerateAnother: (templateId: TemplateId) => void;
}

export function NoteEditor({
  doc,
  siblingTemplateIds,
  onChange,
  onRenameSession,
  onResume,
  onGenerateAnother,
}: Props) {
  const [copied, setCopied] = useState(false);
  const extras = TEMPLATES.filter((t) => !siblingTemplateIds.includes(t.id));
  const isAdhd = doc.templateId === 'adhd_multi_session';

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

  function patchTools(tools: AdhdToolsState) {
    const asrs = tools.asrs || {};
    const sections = doc.sections.map((s) =>
      s.id === 'sec_adhd_tools'
        ? { ...s, content: mergeAsrsIntoToolsContent(s.content, asrs) }
        : s,
    );
    onChange({
      ...doc,
      tools,
      sections,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <label className="block text-xs font-medium text-stone-500">Session name</label>
          <input
            className="w-full text-xl font-semibold outline-none"
            value={doc.sessionName}
            onChange={(e) => onRenameSession(e.target.value)}
            placeholder="Session name"
          />
          <p className="text-sm text-stone-500">
            {templateById(doc.templateId).label}
            {doc.subtitle ? ` · ${doc.subtitle}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
            {copied
              ? 'Copied'
              : isReferralTemplate(doc.templateId)
                ? 'Copy letter'
                : 'Copy for Best Practice'}
          </button>
        </div>
      </div>

      {extras.length && doc.transcript?.trim() ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3">
          <p className="text-xs font-semibold text-emerald-900">More documents from this session</p>
          <p className="mt-0.5 text-[11px] text-emerald-800/80">
            Reuses this transcript — e.g. add a GPCCMP after the H&amp;P note.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {extras.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onGenerateAnother(t.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                Generate {t.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {doc.summary ? <p className="text-sm text-stone-600">{doc.summary}</p> : null}
      {doc.sections.map((sec) => (
        <Fragment key={sec.id}>
          {isAdhd && sec.id === 'sec_adhd_tools' ? (
            <AdhdTools value={doc.tools} onChange={patchTools} />
          ) : null}
          <section className="rounded-xl border border-stone-200 bg-white p-3">
            <h2 className="mb-2 text-sm font-semibold">{sec.title}</h2>
            <textarea
              className="w-full resize-y rounded-lg border border-stone-100 p-2 font-mono text-sm"
              rows={Math.max(4, sec.content.split('\n').length + 1)}
              value={sec.content}
              onChange={(e) => patchSection(sec.id, e.target.value)}
            />
          </section>
        </Fragment>
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
