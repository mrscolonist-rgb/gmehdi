# AI Studio editor notes

This is a slim GP medical scribe for Google AI Studio Build (free tier). Cursor wrote the app; Studio models should make **small, local edits**.

## Where to edit (do not rewrite routing)

| Change | File |
| --- | --- |
| Clinical note wording / evidence rules | `prompts/hp-brief.md`, `prompts/gpccmp.md`, `prompts/adhd.md` |
| Referral letter rules | `prompts/referral-new.md`, `prompts/referral-continuing.md` |
| Transcription or BP screenshot instructions | `server/gemini.ts` (3.5 Transcribe), `server/routes/transcribe.ts` (Flash then Groq Whisper + polish on 429), `prompts/transcribe.md`, `prompts/ehr-bp.md` |
| Pure scribe vs balanced vs senior colleague | `prompts/assistance.md` |
| Template labels, sections, default assistance/detail | `src/data/templates.ts` |
| Model IDs | `server/config.ts` only — STT `gemini-3.5-transcribe`; notes prefer `gemini-3.7-flash` then other Flash; Groq Whisper + `gpt-oss`/`qwen` last resort (no Llama) |
| API keys | `server/apiKey.ts` (Gemini) + `server/groq.ts` (`GROQ_API_KEY`). Empty `.env` values stripped in `server.ts` so AI Studio Secrets work |

Do **not** merge transcribe into structure. Structure receives a transcript string, never audio.
Allowed template IDs only: `hp_brief`, `gpccmp`, `adhd_multi_session`, `referral_new`, `referral_continuing`.
Do **not** add a specialist copilot, mentors, Medication Review, MHCP, or other PMS besides Best Practice.
Do **not** persist notes on disk. Browser `localStorage` only (`src/storage.ts`).

## Sessions (do not remove)

- Clinician sets **session name** before recording (`Studio` session name field).
- One `sessionId` can hold **multiple documents** (H&P + GPCCMP + ADHD + referral letters) from the same transcript — each Generate is upserted into `localStorage` (`myscribe_notes_v1`) and listed in Library.
- **Session isolation:** each New session gets a fresh `sessionId`. Transcript, patient context, BP (`ehrContext`), and ADHD tools are stored on that session only and mirrored to sibling docs via `syncSessionConsult` — never across sessions. Studio remounts on New so UI state cannot leak from the previous consult.
- Library groups by session name. “Add / Generate {template}” reuses **that session’s** transcript / tools / context / BP capture.
- Referral letters: always pure scribe + concise. Specialty + reason chosen from `/api/extract-referral-reasons` suggestions (`ReferralFields.tsx`). Letter scoped to that reason only.
- Session helpers live in `src/sessions.ts`.
- Patient context uses on-demand mini-sections (`src/patientContext.ts`) including Meds + PMHx paste if a BP screenshot missed those panes. Last-session paste is comparison / follow-up only — prior vitals must not appear as today's findings (`prompts/patient-context.md`).
- BP capture: share once (on Windows prefer **Entire screen** — native Premier window-share is often a black GPU frame); **Extract requires Current Rx + Past history** (or Whole window). Patient banner alone is blocked. Vision OCR merges all frames (`prompts/ehr-bp.md`, `BpScreenCapture.tsx`).
- ADHD tools: optional slide-over (`AdhdToolsPanel.tsx`) on Studio during Record / after Stop, and again on Adult ADHD notes. Does not change Record → Transcribe → Generate. ASRS-v1.1 Part A/B sync each clicked frequency into Assessment Tools (`src/data/asrs.ts`). The DSM-5 symptom checklist is Criterion A and syncs ticked symptoms into Diagnostic Impression (`src/data/dsm5CriteriaA.ts`). Optional Criteria B–E formulation (`src/data/dsm5Formulation.ts`), differential (`src/data/differential.ts`), education (`src/data/education.ts`), and pre-treatment safety (`src/data/safety.ts`) also sync when filled (on Generate for Adult ADHD, or live in the editor). Formulation defaults to multi-session **in progress**; final met/not-met only when marked final diagnostic session.

## File size

Keep every source file under ~250 lines. Split rather than grow `server.ts` or `App.tsx`.

## Copy / Best Practice

Clinical notes: `src/utils/dashBullet.ts` → plain `-` bullets for BP progress notes.
Referral letters: same copy helper joins Opening/Body/Closing as paragraph prose (not dash-forced).

## Audio length

Long ADHD consults (30–60 min) are split in the browser (`src/utils/audio.ts` + `chunkAudio.ts`) into ~6 min / ~9 MB chunks, transcribed one-by-one (client waits ~2.5s between chunks to ease free-tier RPM). Recording never calls Gemini — only Stop & transcribe / Upload does. STT tries `gemini-3.5-transcribe`, then Flash if that is not a 429, then **Groq Whisper** (`whisper-large-v3` with medical prompt + light `gpt-oss-20b` polish for spellings only) when `GROQ_API_KEY` is set. Note Generate prefers `gemini-3.7-flash`, then other Flash buckets, then Groq `gpt-oss-120b` / Qwen. A failed chunk must not discard the rest of the transcript unless both providers are quota-exhausted.

## Record → Generate (do not collapse)

1. **Stop & transcribe** only fills the transcript box (does not structure).
2. While transcription runs (and while recording), clinician may fill **ADHD tools** and **patient context** — do not lock those UI surfaces during STT busy state.
3. User chooses template / referral reason (Adult ADHD to apply tools).
4. **Generate note** / **Generate referral letter** runs `/api/structure` once; `patientContext` goes into structure; ADHD `tools` merge in `assembleNote` for Adult ADHD.
Do not make Stop auto-generate the document again.
