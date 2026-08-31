# AI Studio editor notes

This is a slim GP medical scribe for Google AI Studio Build (free tier). Cursor wrote the app; Studio models should make **small, local edits**.

## Where to edit (do not rewrite routing)

| Change | File |
| --- | --- |
| Clinical note wording / evidence rules | `prompts/hp-brief.md`, `prompts/gpccmp.md`, `prompts/adhd.md` |
| Referral letter rules | `prompts/referral-new.md`, `prompts/referral-continuing.md` |
| Transcription or BP screenshot instructions | `prompts/transcribe.md`, `prompts/ehr-bp.md` |
| Pure scribe vs balanced vs senior colleague | `prompts/assistance.md` |
| Template labels, sections, default assistance/detail | `src/data/templates.ts` |
| Gemini model IDs | `server/config.ts` only |

Do **not** merge transcribe into structure. Structure receives a transcript string, never audio.
Allowed template IDs only: `hp_brief`, `gpccmp`, `adhd_multi_session`, `referral_new`, `referral_continuing`.
Do **not** add a specialist copilot, mentors, Medication Review, MHCP, or other PMS besides Best Practice.
Do **not** persist notes on disk. Browser `localStorage` only (`src/storage.ts`).

## Sessions (do not remove)

- Clinician sets **session name** before recording (`Studio` session name field).
- One `sessionId` can hold **multiple documents** (H&P + GPCCMP + ADHD + referral letters) from the same transcript.
- Library groups by session name. “Add / Generate {template}” reuses the session transcript.
- Referral letters: always pure scribe + concise. Specialty + reason chosen from `/api/extract-referral-reasons` suggestions (`ReferralFields.tsx`). Letter scoped to that reason only.
- Session helpers live in `src/sessions.ts`.
- Patient context uses on-demand mini-sections (`src/patientContext.ts`). Last-session paste is comparison / follow-up only — prior vitals must not appear as today's findings (`prompts/patient-context.md`).
- ADHD notes: interactive ASRS-v1.1 in the note editor (`src/data/asrs.ts`, `AsrsTool.tsx`). Scores only — no item wording changes, no clinical interpretation.

## File size

Keep every source file under ~250 lines. Split rather than grow `server.ts` or `App.tsx`.

## Copy / Best Practice

Clinical notes: `src/utils/dashBullet.ts` → plain `-` bullets for BP progress notes.
Referral letters: same copy helper joins Opening/Body/Closing as paragraph prose (not dash-forced).

## Audio length

Long ADHD consults (30–60 min) are split in the browser (`src/utils/audio.ts` + `chunkAudio.ts`) into ~6 min / ~9 MB chunks, transcribed one-by-one.

## Record → Generate (do not collapse)

1. **Stop & transcribe** only fills the transcript box (does not structure).
2. User chooses template / referral reason after the transcript exists.
3. **Generate note** / **Generate referral letter** runs `/api/structure` once.
Do not make Stop auto-generate the document again.
