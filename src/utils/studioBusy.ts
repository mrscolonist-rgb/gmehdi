/** Busy UI phases — STT must not lock ADHD tools / patient context. */
export function studioPhase(localBusy: string, busy: string) {
  const busyMsg = busy || localBusy;
  const transcribing = Boolean(localBusy) || /^Transcribing/i.test(busy);
  const structuring = /Structuring|Generating referral/i.test(busy);
  return { busyMsg, transcribing, structuring };
}
