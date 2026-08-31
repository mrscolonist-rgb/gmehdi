import { Trash2, X } from 'lucide-react';
import type { ScribeDocument } from '../types.ts';
import { templateById } from '../data/templates.ts';

interface Props {
  notes: ScribeDocument[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function Library({ notes, onOpen, onDelete, onClose }: Props) {
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
        {notes.length === 0 ? (
          <p className="text-sm text-stone-500">No notes yet. Notes stay in this browser only.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-2 rounded-lg border border-stone-200 p-3">
                <button type="button" className="text-left text-sm" onClick={() => onOpen(n.id)}>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-stone-500">
                    {templateById(n.templateId).label} · {new Date(n.updatedAt).toLocaleString('en-AU')}
                  </p>
                </button>
                <button
                  type="button"
                  className="text-stone-400 hover:text-red-700"
                  onClick={() => onDelete(n.id)}
                  aria-label="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
