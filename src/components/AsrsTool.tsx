import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  ASRS_PART_A,
  ASRS_PART_B,
  FREQUENCY_OPTIONS,
  itemScorePartA,
  scoreAsrs,
  type AsrsAnswers,
  type AsrsItem,
  type Frequency,
} from '../data/asrs.ts';

interface Props {
  answers: AsrsAnswers;
  onChange: (next: AsrsAnswers) => void;
}

function OptionRow({
  item,
  value,
  showShadedScore,
  onPick,
}: {
  item: AsrsItem;
  value: Frequency | undefined;
  showShadedScore: boolean;
  onPick: (f: Frequency) => void;
}) {
  const scored = showShadedScore ? itemScorePartA(item, value) : null;
  return (
    <div className="rounded-lg border border-stone-100 bg-stone-50/50 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-stone-800">
          <span className="font-semibold text-stone-500">Q{item.id}.</span> {item.text}
        </p>
        {scored !== null ? (
          <span className="shrink-0 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-800">
            {scored}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {FREQUENCY_OPTIONS.map((opt) => {
          const shaded = showShadedScore && item.shadedScores?.includes(opt.value);
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPick(opt.value)}
              className={`rounded-md border px-2 py-1 text-[11px] ${
                on
                  ? shaded
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-stone-800 bg-stone-800 text-white'
                  : shaded
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
              }`}
            >
              {opt.label}
              {showShadedScore ? (
                <span className="ml-1 opacity-70">{shaded ? '1' : '0'}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AsrsTool({ answers, onChange }: Props) {
  const [partBOpen, setPartBOpen] = useState(false);
  const totals = scoreAsrs(answers);

  function setAnswer(id: number, freq: Frequency) {
    if (answers[id] === freq) {
      const next = { ...answers };
      delete next[id];
      onChange(next);
      return;
    }
    onChange({ ...answers, [id]: freq });
  }

  const inatt = ASRS_PART_B.filter((i) => i.domain === 'inattention');
  const hyper = ASRS_PART_B.filter((i) => i.domain === 'hyperactivity');

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-stone-900">ASRS-v1.1 Part A (optional)</p>
        <p className="text-[11px] text-stone-500">
          Last 6 months. Click a frequency — it syncs into Assessment Tools as clicked. Click again
          to clear. Shaded options score 1. No interpretation. Unanswered items stay out of the note.
        </p>
        <div className="mt-2 space-y-2">
          {ASRS_PART_A.map((item) => (
            <OptionRow
              key={item.id}
              item={item}
              value={answers[item.id]}
              showShadedScore
              onPick={(f) => setAnswer(item.id, f)}
            />
          ))}
        </div>
        <p className="mt-2 rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white">
          Part A total: {totals.partA} / {totals.partAMax}
          <span className="ml-2 text-xs font-normal text-stone-300">
            ({totals.partAAnswered} answered)
          </span>
        </p>
      </div>

      <div className="rounded-lg border border-stone-200">
        <button
          type="button"
          onClick={() => setPartBOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold"
        >
          <span>ASRS-v1.1 Part B (optional detail)</span>
          {partBOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {partBOpen ? (
          <div className="space-y-3 border-t border-stone-100 p-3">
            <p className="text-[11px] text-stone-500">
              Optional. Each frequency syncs into Assessment Tools as clicked. Summary counts Often /
              Very Often. No interpretation. Unanswered items stay out of the note.
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Inattention
            </p>
            <div className="space-y-2">
              {inatt.map((item) => (
                <OptionRow
                  key={item.id}
                  item={item}
                  value={answers[item.id]}
                  showShadedScore={false}
                  onPick={(f) => setAnswer(item.id, f)}
                />
              ))}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Hyperactivity / impulsivity
            </p>
            <div className="space-y-2">
              {hyper.map((item) => (
                <OptionRow
                  key={item.id}
                  item={item}
                  value={answers[item.id]}
                  showShadedScore={false}
                  onPick={(f) => setAnswer(item.id, f)}
                />
              ))}
            </div>
            <div className="rounded-lg bg-stone-900 px-3 py-2 text-sm text-white">
              <p className="font-semibold">Part B summary (Often / Very Often)</p>
              <p className="mt-1 text-xs">
                Inattention (Q7–11): {totals.partBInattention} / {totals.partBInattentionMax}
              </p>
              <p className="text-xs">
                Hyperactivity (Q12–18): {totals.partBHyperactivity} /{' '}
                {totals.partBHyperactivityMax}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
