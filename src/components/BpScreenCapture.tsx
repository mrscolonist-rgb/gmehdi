import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import type { EhrContext } from '../types.ts';
import { extractEhr } from '../api.ts';
import {
  BP_PANES,
  bpExtractReady,
  ehrListGroups,
  ehrSummaryLine,
  startBpShare,
  type BpPaneId,
  type BpShare,
} from '../utils/screenCapture.ts';

interface Props {
  ehr: EhrContext | null;
  onChange: (ehr: EhrContext | null) => void;
}

type Grabs = Partial<Record<BpPaneId, string>>;

export function BpScreenCapture({ ehr, onChange }: Props) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [share, setShare] = useState<BpShare | null>(null);
  const [grabs, setGrabs] = useState<Grabs>({});
  const previewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => () => share?.stop(), [share]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    el.srcObject = share?.stream ?? null;
    if (share) void el.play().catch(() => undefined);
  }, [share]);

  async function beginShare() {
    setError('');
    try {
      const session = await startBpShare();
      setShare(session);
      setGrabs({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Screen share failed');
    }
  }

  async function grab(pane: BpPaneId) {
    if (!share) return;
    setError('');
    setBusy(`Grabbing ${pane}…`);
    try {
      const image = await share.grabFrame();
      setGrabs((prev) => ({ ...prev, [pane]: image }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not grab this pane');
    } finally {
      setBusy('');
    }
  }

  async function extract() {
    const ready = bpExtractReady(grabs);
    if (!ready.ok) {
      setError(
        `Grab ${ready.missing.join(' and ')} before Extract — patient banner alone is not enough (meds + PMHx needed for GPCCMP). Or grab Whole window if all panes are on screen.`,
      );
      return;
    }
    const frames = BP_PANES.filter((p) => grabs[p.id]).map((p) => ({
      pane: p.id,
      imageBase64: grabs[p.id] as string,
    }));
    setBusy('Reading BP screens…');
    setError('');
    try {
      const extracted = await extractEhr(frames);
      onChange(extracted);
      share?.stop();
      setShare(null);
      setGrabs({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'BP extract failed');
    } finally {
      setBusy('');
    }
  }

  function cancelShare() {
    share?.stop();
    setShare(null);
    setGrabs({});
  }

  const ready = bpExtractReady(grabs);
  const grabCount = BP_PANES.filter((p) => grabs[p.id]).length;
  const groups = ehr ? ehrListGroups(ehr) : [];

  return (
    <div className="flex h-full min-h-[148px] flex-col rounded-xl border border-stone-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Best Practice screen</p>
          <p className="text-xs text-stone-500">
            On Windows pick <span className="font-medium text-stone-700">Entire screen</span> (the
            BP monitor), not Window — native Premier often shares as a black frame. Then open each
            pane and grab. Extract needs{' '}
            <span className="font-medium text-stone-700">Current Rx + Past history</span>.
          </p>
        </div>
        {ehr && !share ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-stone-400 hover:text-stone-700"
            aria-label="Clear BP capture"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {ehr && !share ? (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-emerald-800">{ehrSummaryLine(ehr)}</p>
          {groups.map((g) => (
            <p key={g.label} className="line-clamp-4 text-[11px] text-stone-600">
              <span className="font-medium">{g.label}:</span> {g.items.join('; ')}
            </p>
          ))}
          {!ehr.currentMedications?.length && !ehr.pastMedicalHistory?.length ? (
            <p className="text-[11px] text-amber-800">
              No meds/PMHx in extract — recapture with Current Rx and Past history open.
            </p>
          ) : null}
        </div>
      ) : null}

      {share ? (
        <div className="mt-2 flex flex-col gap-1.5">
          <video
            ref={previewRef}
            muted
            playsInline
            className="h-24 w-full rounded-lg border border-stone-200 bg-black object-contain"
            aria-label="Live share preview"
          />
          <p className="text-[11px] text-stone-500">
            If this preview is black, Cancel and share Entire screen — not the BP window.
          </p>
          {BP_PANES.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={Boolean(busy)}
              title={p.hint}
              onClick={() => void grab(p.id)}
              className={`rounded-lg border px-2 py-1 text-left text-xs ${
                grabs[p.id]
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                  : p.required
                    ? 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
                    : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              {grabs[p.id] ? '✓ ' : ''}
              {p.label}
              {p.required ? ' *' : ''}
              <span className="ml-1 text-stone-500">— {p.hint}</span>
            </button>
          ))}
          {!ready.ok ? (
            <p className="text-[11px] text-amber-800">
              Still need: {ready.missing.join(', ')} (or Whole window).
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        {!share ? (
          <button
            type="button"
            onClick={() => void beginShare()}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm hover:bg-stone-50 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {ehr ? 'Recapture BP' : 'Share BP window'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void extract()}
              disabled={Boolean(busy) || !ready.ok}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-800 px-3 py-1.5 text-sm text-white hover:bg-emerald-900 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Extract {grabCount} pane{grabCount === 1 ? '' : 's'}
            </button>
            <button
              type="button"
              onClick={cancelShare}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              Cancel share
            </button>
          </>
        )}
      </div>
      {busy ? <p className="mt-1 text-[11px] text-stone-500">{busy}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
