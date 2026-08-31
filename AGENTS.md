# AI Studio editor notes

This is a slim GP medical scribe for Google AI Studio Build (free tier). Cursor wrote the app; Studio models should make **small, local edits**.

## Where to edit (do not rewrite routing)

| Change | File |
| --- | --- |
| Clinical note wording / evidence rules | `prompts/hp-brief.md`, `prompts/gpccmp.md`, `prompts/adhd.md` |
| Transcription or BP screenshot instructions | `prompts/transcribe.md`, `prompts/ehr-bp.md` |
| Pure scribe vs balanced vs senior colleague | `prompts/assistance.md` |
| Template labels, sections, default assistance/detail | `src/data/templates.ts` |
| Gemini model IDs | `server/config.ts` only |

Do **not** merge transcribe into structure. Structure receives a transcript string, never audio.
Do **not** add templates beyond the three IDs: `hp_brief`, `gpccmp`, `adhd_multi_session`.
Do **not** add a specialist copilot, mentors, Medication Review, MHCP, or other PMS besides Best Practice.
Do **not** persist notes on disk. Browser `localStorage` only (`src/storage.ts`).

## File size

Keep every source file under ~250 lines. Split rather than grow `server.ts` or `App.tsx`.

## Copy / Best Practice

`src/utils/dashBullet.ts` turns the editor sections into plain `-` bullet text for BP progress notes. Copy must stay dash-bullet, Australian spelling, no markdown cards.

## Audio length

Long ADHD consults (30–60 min) are split in the browser (`src/utils/audio.ts` + `chunkAudio.ts`) into ~6 min / ~9 MB chunks, transcribed one-by-one, then **one** `/api/structure` call on the full transcript.
