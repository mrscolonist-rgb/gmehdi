import type { ScribeDocument } from '../types.ts';
import { isReferralTemplate } from '../data/templates.ts';

function stripMd(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/[\u2022\u00b7]/g, '-')
    .trim();
}

function ensureDashes(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const t = line.trimEnd();
      if (!t) return '';
      if (/^\s*(-|\d+\.)\s/.test(t)) return t.replace(/^\s*\*\s+/, '- ');
      if (/^\s+\S/.test(t)) return t.replace(/^\s+/, '  - ');
      return t;
    })
    .join('\n');
}

/** Clinical notes: section titles + dash bullets. Referral letters: paragraph prose. */
export function toDashBulletText(doc: ScribeDocument): string {
  const letter = isReferralTemplate(doc.templateId);
  const blocks: string[] = [];
  for (const sec of doc.sections || []) {
    const raw = stripMd(sec.content || '');
    if (!raw) continue;
    const body = letter ? raw : ensureDashes(raw);
    if (letter) {
      blocks.push(body);
    } else {
      blocks.push(`${sec.title}\n${body}`);
    }
  }
  return blocks.join('\n\n').trim();
}

export async function copyDashBullet(doc: ScribeDocument): Promise<boolean> {
  const text = toDashBulletText(doc);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
