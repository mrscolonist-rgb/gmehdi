import { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import type { ReferralBrevity, ReferralOptions, ReferralOutputType, TemplateId } from '../types.ts';
import { extractReferralReasons } from '../api.ts';

interface Props {
  templateId: TemplateId;
  value: ReferralOptions;
  /** Transcript and/or note text used to suggest reasons. */
  sourceText: string;
  patientContext?: string;
  disabled?: boolean;
  onChange: (next: ReferralOptions) => void;
}

export const EMPTY_REFERRAL: ReferralOptions = {
  specialty: '',
  referralReason: '',
  continuingCondition: '',
  outputType: 'full_letter',
  brevityLevel: 'brief',
};

export function ReferralFields({
  templateId,
  value,
  sourceText,
  patientContext = '',
  disabled,
  onChange,
}: Props) {
  const continuing = templateId === 'referral_continuing';
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lastKey = useRef('');

  const selected = continuing ? value.continuingCondition : value.referralReason;
  const patch = (partial: Partial<ReferralOptions>) => onChange({ ...value, ...partial });

  async function loadSuggestions(force = false) {
    const key = `${templateId}|${sourceText.trim()}|${patientContext.trim()}`;
    if (!force && key === lastKey.current) return;
    if (!sourceText.trim() && !patientContext.trim()) {
      setSuggestions([]);
      setError('Paste or open a session transcript first, then find reasons.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await extractReferralReasons({
        transcript: sourceText,
        patientContext,
        mode: continuing ? 'continuing' : 'new',
      });
      lastKey.current = key;
      setSuggestions(data.reasons || []);
      if (data.suggestedSpecialty && !value.specialty.trim()) {
        patch({ specialty: data.suggestedSpecialty });
      }
      if (!(data.reasons || []).length) {
        setError('No clear referral reasons found — type one below.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not extract reasons');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sourceText.trim()) return;
    void loadSuggestions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run when source/template changes
  }, [templateId, sourceText]);

  function chooseReason(reason: string) {
    if (continuing) patch({ continuingCondition: reason });
    else patch({ referralReason: reason });
  }

  return (
    <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-sky-950">Referral letter options</p>
        <p className="text-[11px] text-sky-900/70">Always pure scribe · concise</p>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Specialty</span>
        <input
          type="text"
          disabled={disabled}
          value={value.specialty}
          onChange={(e) => patch({ specialty: e.target.value })}
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white p-2"
          placeholder="e.g. Cardiology, Psychiatry, Orthopaedics"
        />
      </label>

      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">
            {continuing ? 'Condition for continuing care' : 'Reason for referral'}
          </span>
          <button
            type="button"
            disabled={disabled || loading}
            onClick={() => void loadSuggestions(true)}
            className="inline-flex items-center gap-1 rounded-md border border-sky-300 bg-white px-2 py-1 text-[11px] font-medium text-sky-950 hover:bg-sky-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Find in note
          </button>
        </div>
        <p className="mb-2 text-[11px] text-stone-600">
          Choose what the GP referred for. Only content related to that reason goes in the letter.
        </p>
        {suggestions.length > 0 ? (
          <ul className="mb-2 space-y-1.5">
            {suggestions.map((reason) => {
              const on = selected.trim() === reason;
              return (
                <li key={reason}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => chooseReason(reason)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      on
                        ? 'border-sky-600 bg-sky-100 font-medium text-sky-950'
                        : 'border-stone-200 bg-white hover:border-sky-300'
                    }`}
                  >
                    {reason}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        <input
          type="text"
          disabled={disabled}
          value={selected}
          onChange={(e) => chooseReason(e.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-white p-2 text-sm"
          placeholder={
            continuing
              ? 'Or type the continuing condition…'
              : 'Or type / edit the referral reason…'
          }
        />
        {error ? <p className="mt-1 text-xs text-amber-800">{error}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium">Output</span>
          <select
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white p-2"
            value={value.outputType}
            onChange={(e) => patch({ outputType: e.target.value as ReferralOutputType })}
          >
            <option value="full_letter">Full letter</option>
            <option value="body_only">Body only</option>
          </select>
        </label>
        {continuing ? (
          <label className="text-sm">
            <span className="font-medium">Brevity</span>
            <select
              disabled={disabled}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white p-2"
              value={value.brevityLevel}
              onChange={(e) => patch({ brevityLevel: e.target.value as ReferralBrevity })}
            >
              <option value="standard">Standard</option>
              <option value="brief">Brief</option>
            </select>
          </label>
        ) : (
          <p className="self-end text-xs text-stone-500">
            Unrelated problems in the consult are omitted from the letter.
          </p>
        )}
      </div>
    </div>
  );
}

export function referralReady(templateId: TemplateId, value: ReferralOptions): boolean {
  if (!value.specialty.trim()) return false;
  if (templateId === 'referral_continuing') return Boolean(value.continuingCondition.trim());
  if (templateId === 'referral_new') return Boolean(value.referralReason.trim());
  return true;
}
