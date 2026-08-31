/** Shown while STT runs — tools/context stay usable in parallel. */
export function TranscribeBanner({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
      {message || 'Transcribing audio…'} You can open <span className="font-medium">ADHD tools</span>{' '}
      and fill <span className="font-medium">patient context</span> now — both are included when you
      Generate.
    </p>
  );
}
