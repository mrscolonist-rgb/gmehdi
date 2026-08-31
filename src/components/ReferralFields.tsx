import type { ReferralBrevity, ReferralOptions, ReferralOutputType, TemplateId } from '../types.ts';

interface Props {
  templateId: TemplateId;
  value: ReferralOptions;
  disabled?: boolean;
  onChange: (next: ReferralOptions) => void;
}

export const EMPTY_REFERRAL: ReferralOptions = {
  specialty: '',
  referralReason: '',
  continuingCondition: '',
  outputType: 'full_letter',
  brevityLevel: 'standard',
};

export function ReferralFields({ templateId, value, disabled, onChange }: Props) {
  const continuing = templateId === 'referral_continuing';
  const patch = (partial: Partial<ReferralOptions>) => onChange({ ...value, ...partial });

  return (
    <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/60 p-3">
      <p className="text-xs font-semibold text-sky-950">Referral letter details</p>
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
      {continuing ? (
        <label className="block text-sm">
          <span className="font-medium">Continuing condition</span>
          <input
            type="text"
            disabled={disabled}
            value={value.continuingCondition}
            onChange={(e) => patch({ continuingCondition: e.target.value })}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white p-2"
            placeholder="e.g. Atrial fibrillation, Adult ADHD"
          />
        </label>
      ) : (
        <label className="block text-sm">
          <span className="font-medium">Referral reason</span>
          <input
            type="text"
            disabled={disabled}
            value={value.referralReason}
            onChange={(e) => patch({ referralReason: e.target.value })}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white p-2"
            placeholder="e.g. Opinion on paroxysmal AF / consideration of ablation"
          />
        </label>
      )}
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
          <p className="self-end text-xs text-stone-500">Patient context field acts as optional &lt;context&gt;.</p>
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
