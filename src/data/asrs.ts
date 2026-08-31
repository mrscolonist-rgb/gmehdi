/** Adult ADHD Self-Report Scale (ASRS-v1.1) — WHO / Workgroup items. Scores only; no interpretation. */

export type Frequency = 0 | 1 | 2 | 3 | 4;

export const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Very Often' },
];

export interface AsrsItem {
  id: number;
  text: string;
  /** Part A: frequency values that score 1 (shaded boxes). Unused for Part B summary. */
  shadedScores?: Frequency[];
  domain?: 'inattention' | 'hyperactivity';
}

/** Part A screener — shaded boxes score 1 (Q1–3 Sometimes+; Q4–6 Often+). */
export const ASRS_PART_A: AsrsItem[] = [
  {
    id: 1,
    text: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
    shadedScores: [2, 3, 4],
  },
  {
    id: 2,
    text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
    shadedScores: [2, 3, 4],
  },
  {
    id: 3,
    text: 'How often do you have problems remembering appointments or obligations?',
    shadedScores: [2, 3, 4],
  },
  {
    id: 4,
    text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    shadedScores: [3, 4],
  },
  {
    id: 5,
    text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    shadedScores: [3, 4],
  },
  {
    id: 6,
    text: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
    shadedScores: [3, 4],
  },
];

/** Part B — frequency profile; summary counts Often / Very Often only. */
export const ASRS_PART_B: AsrsItem[] = [
  {
    id: 7,
    domain: 'inattention',
    text: 'How often do you make careless mistakes when you have to work on a boring or difficult project?',
  },
  {
    id: 8,
    domain: 'inattention',
    text: 'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?',
  },
  {
    id: 9,
    domain: 'inattention',
    text: 'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
  },
  {
    id: 10,
    domain: 'inattention',
    text: 'How often do you misplace or have difficulty finding things at home or at work?',
  },
  {
    id: 11,
    domain: 'inattention',
    text: 'How often are you distracted by activity or noise around you?',
  },
  {
    id: 12,
    domain: 'hyperactivity',
    text: 'How often do you leave your seat in meetings or other situations in which you are expected to remain seated?',
  },
  {
    id: 13,
    domain: 'hyperactivity',
    text: 'How often do you feel restless or fidgety?',
  },
  {
    id: 14,
    domain: 'hyperactivity',
    text: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?',
  },
  {
    id: 15,
    domain: 'hyperactivity',
    text: 'How often do you find yourself talking too much when you are in social situations?',
  },
  {
    id: 16,
    domain: 'hyperactivity',
    text: "When you're in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?",
  },
  {
    id: 17,
    domain: 'hyperactivity',
    text: 'How often do you have difficulty waiting your turn in situations when turn taking is required?',
  },
  {
    id: 18,
    domain: 'hyperactivity',
    text: 'How often do you interrupt others when they are busy?',
  },
];

export type AsrsAnswers = Partial<Record<number, Frequency>>;

export interface AsrsTotals {
  partA: number;
  partAMax: 6;
  partAAnswered: number;
  partBInattention: number;
  partBInattentionMax: 5;
  partBHyperactivity: number;
  partBHyperactivityMax: 7;
  partBAnswered: number;
}

export function itemScorePartA(item: AsrsItem, freq: Frequency | undefined): 0 | 1 | null {
  if (freq === undefined) return null;
  return item.shadedScores?.includes(freq) ? 1 : 0;
}

export function scoreAsrs(answers: AsrsAnswers): AsrsTotals {
  let partA = 0;
  let partAAnswered = 0;
  for (const item of ASRS_PART_A) {
    const f = answers[item.id];
    if (f === undefined) continue;
    partAAnswered += 1;
    partA += itemScorePartA(item, f) || 0;
  }

  let partBInattention = 0;
  let partBHyperactivity = 0;
  let partBAnswered = 0;
  for (const item of ASRS_PART_B) {
    const f = answers[item.id];
    if (f === undefined) continue;
    partBAnswered += 1;
    const oftenPlus = f >= 3 ? 1 : 0;
    if (item.domain === 'inattention') partBInattention += oftenPlus;
    else partBHyperactivity += oftenPlus;
  }

  return {
    partA,
    partAMax: 6,
    partAAnswered,
    partBInattention,
    partBInattentionMax: 5,
    partBHyperactivity,
    partBHyperactivityMax: 7,
    partBAnswered,
  };
}

const ASRS_BLOCK_RE = /\[ASRS-v1\.1\][\s\S]*?\[\/ASRS-v1\.1\]\n*/g;

/** Plain score lines for the Assessment Tools section — facts only. */
export function formatAsrsNoteBlock(answers: AsrsAnswers): string {
  const t = scoreAsrs(answers);
  if (t.partAAnswered === 0 && t.partBAnswered === 0) return '';
  const lines = ['[ASRS-v1.1]'];
  if (t.partAAnswered > 0) {
    lines.push(
      `- ASRS-v1.1 Part A: ${t.partA} / ${t.partAMax} (${t.partAAnswered} answered)`,
    );
  }
  if (t.partBAnswered > 0) {
    lines.push(
      `- ASRS-v1.1 Part B Inattention (Often/Very Often): ${t.partBInattention} / ${t.partBInattentionMax}`,
    );
    lines.push(
      `- ASRS-v1.1 Part B Hyperactivity/Impulsivity (Often/Very Often): ${t.partBHyperactivity} / ${t.partBHyperactivityMax}`,
    );
  }
  lines.push('[/ASRS-v1.1]');
  return lines.join('\n');
}

export function mergeAsrsIntoToolsContent(content: string, answers: AsrsAnswers): string {
  const base = (content || '').replace(ASRS_BLOCK_RE, '').trimEnd();
  const block = formatAsrsNoteBlock(answers);
  if (!block) return base;
  return base ? `${base}\n\n${block}` : block;
}
