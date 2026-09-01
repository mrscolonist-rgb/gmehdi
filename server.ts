import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { clearEmptyEnvKeys, hasApiKey } from './server/apiKey.ts';
import { hasGroqKey } from './server/groq.ts';
import { JSON_BODY_LIMIT, PORT } from './server/config.ts';
import health from './server/routes/health.ts';
import transcribe from './server/routes/transcribe.ts';
import structure from './server/routes/structure.ts';
import extractEhr from './server/routes/extract-ehr.ts';
import extractReferralReasons from './server/routes/extract-referral-reasons.ts';

dotenv.config({ path: '.env.local' });
dotenv.config();
// Empty GEMINI_API_KEY="" from .env.example must not block AI Studio Secrets.
clearEmptyEnvKeys();

const app = express();
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));

app.use(health);
app.use(transcribe);
app.use(structure);
app.use(extractEhr);
app.use(extractReferralReasons);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MyScribe running at http://0.0.0.0:${PORT}`);
    console.log(
      hasApiKey()
        ? 'GEMINI_API_KEY detected'
        : 'GEMINI_API_KEY missing — set AI Studio Secret or .env.local, then restart',
    );
    console.log(
      hasGroqKey()
        ? 'GROQ_API_KEY detected — Whisper backup for STT 429s'
        : 'GROQ_API_KEY missing — Gemini 429 will fail Stop & transcribe',
    );
  });
}

startServer();
