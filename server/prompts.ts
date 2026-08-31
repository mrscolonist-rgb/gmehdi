import fs from 'fs';
import path from 'path';

const DIR = path.join(process.cwd(), 'prompts');
const cache = new Map<string, string>();

const STYLE_FILES: Record<string, string> = {
  hp_brief: 'hp-brief.md',
  gpccmp: 'gpccmp.md',
  adhd_multi_session: 'adhd.md',
  referral_new: 'referral-new.md',
  referral_continuing: 'referral-continuing.md',
};

export function isReferralStyle(styleId: string): boolean {
  return styleId === 'referral_new' || styleId === 'referral_continuing';
}

export function loadPrompt(fileName: string): string {
  const hit = cache.get(fileName);
  if (hit) return hit;
  const text = fs.readFileSync(path.join(DIR, fileName), 'utf8');
  cache.set(fileName, text);
  return text;
}

export function styleIds(): string[] {
  return Object.keys(STYLE_FILES);
}

export function loadStylePrompt(styleId: string): string {
  const file = STYLE_FILES[styleId];
  if (!file) {
    throw new Error(`Unknown template "${styleId}". Valid: ${styleIds().join(', ')}`);
  }
  return loadPrompt(file);
}

export function loadAssistance(degree: string): string {
  const md = loadPrompt('assistance.md');
  const wanted =
    degree === 'senior_colleague' || degree === 'balanced' ? degree : 'pure_scribe';
  const parts = md.split(/^##\s+/m).filter(Boolean);
  const match = parts.find((p) => p.startsWith(wanted));
  const block = match || parts[0] || '';
  return block.replace(/^[^\n]+\n/, '').trim();
}

export function detailGuidance(level: string): string {
  if (level === 'concise') {
    return `DETAIL LEVEL: concise. High-yield dash bullets only. No conversational filler.`;
  }
  if (level === 'comprehensive') {
    return `DETAIL LEVEL: comprehensive. Extract every stated clinical fact. Do not invent unstated facts.`;
  }
  return `DETAIL LEVEL: standard. Complete, balanced dash-bullet documentation of what was stated.`;
}
