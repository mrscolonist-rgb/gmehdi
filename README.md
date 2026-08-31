# MyScribe

Australian GP medical scribe for **Google AI Studio Build** (free tier). Three note styles: H&P Brief, GPCCMP, Adult ADHD multi-session. Output is dash-bullet text for **Best Practice** progress notes.

This repository is meant to be imported or opened in AI Studio. Cursor wrote the code so Studio’s smaller models only need to edit prompts and config.

## Run locally

Prerequisites: Node.js 20+.

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`
3. `npm run dev`
4. Open http://localhost:3000

`GET /api/health` reports whether the API key is set.

## AI Studio

- Secret: `GEMINI_API_KEY` (server-side only)
- `metadata.json` requests microphone + display-capture
- Model IDs live in `server/config.ts`: `gemini-3.5-transcribe` (recorded STT, non-diarised), `gemini-3.5-flash` (structure + BP vision)

Do not start from a 1000-line `server.ts`. See `AGENTS.md` for where to edit.
