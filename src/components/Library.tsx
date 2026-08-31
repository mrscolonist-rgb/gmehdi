import { FilePlus2, Trash2, X } from 'lucide-react';
import type { ScribeDocument, TemplateId } from '../types.ts';
import { templateById, TEMPLATES } from '../data/templates.ts';
import { groupBySession } from '../sessions.ts';

interface Props {
  notes: ScribeDocument[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onGenerateAnother: (sourceId: string, templateId: TemplateId) => void;
  onClose: () => void;
}

export function Library({
  notes,
  onOpen,
  onDelete,
  onDeleteSession,
  onGenerateAnother,
  onClose,
}: Props) {
  const groups = groupBySession(notes);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30 no-print" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Library</h2>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-xs text-stone-500">
          Sessions are named by you. One session can hold several documents (notes and referral letters).
        </p>
        {groups.length === 0 ? (
          <p className="text-sm text-stone-500">No sessions yet. Notes stay in this browser only.</p>
        ) : (
          <ul className="space-y-3">
            {groups.map((g) => {
              const used = new Set(g.docs.map((d) => d.templateId));
              const extras = TEMPLATES.filter((t) => !used.has(t.id));
              const source = g.docs[0];
              return (
                <li key={g.sessionId} className="rounded-xl border border-stone-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-stone-900">{g.sessionName}</p>
                      <p className="text-[11px] text-stone-500">
                        {g.docs.length} document{g.docs.length === 1 ? '' : 's'} ·{' '}
                        {new Date(g.updatedAt).toLocaleString('en-AU')}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-stone-400 hover:text-red-700"
                      onClick={() => onDeleteSession(g.sessionId)}
                      aria-label="Delete session"
                      title="Delete entire session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {g.docs.map((n) => (
                      <li key={n.id} className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 px-2 py-1.5">
                        <button type="button" className="text-left text-sm" onClick={() => onOpen(n.id)}>
                          <span className="font-medium text-emerald-900">
                            {templateById(n.templateId).label}
                          </span>
                          {n.summary ? (
                            <span className="mt-0.5 block line-clamp-1 text-[11px] text-stone-500">
                              {n.summary}
                            </span>
                          ) : null}
                        </button>
                        <button
                          type="button"
                          className="shrink-0 text-stone-400 hover:text-red-700"
                          onClick={() => onDelete(n.id)}
                          aria-label="Delete document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  {extras.length && source.transcript?.trim() ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {extras.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onGenerateAnother(source.id, t.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-900 hover:bg-emerald-100"
                        >
                          <FilePlus2 className="h-3 w-3" />
                          Add {t.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}
