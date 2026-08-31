import type { ScribeDocument } from '../types.ts';

function stripMd(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[\u2022\u00b7]\s+/gm, '- ')
    .replace(/\*$/gm, '')
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

/** Best Practice progress-note paste: section titles + dash bullets, no cards. */
export function toDashBulletText(doc: ScribeDocument): string {
  const blocks: string[] = [];
  for (const sec of doc.sections || []) {
    const body = ensureDashes(stripMd(sec.content || ''));
    if (!body) continue;
    blocks.push(`${sec.title}\n${body}`);
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
