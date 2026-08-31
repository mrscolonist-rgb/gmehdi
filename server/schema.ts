import { Type } from '@google/genai';

/** One structured-note schema for all three templates. */
export const NOTE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Short clinical title' },
    subtitle: { type: Type.STRING, description: 'Consult purpose in one line' },
    summary: { type: Type.STRING, description: '1-2 sentence synopsis of stated content only' },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          type: { type: Type.STRING, description: 'text | bullets | checklist' },
          content: {
            type: Type.STRING,
            description: 'Dash-bullet section body. Australian spelling. No markdown cards.',
          },
        },
        required: ['id', 'title', 'type', 'content'],
      },
    },
    advisories: {
      type: Type.ARRAY,
      description: 'Isolated peer suggestions. Empty array for pure_scribe. Never copy into the note body.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          body: { type: Type.STRING },
        },
        required: ['title', 'body'],
      },
    },
  },
  required: ['title', 'subtitle', 'summary', 'sections', 'advisories'],
};

export const EHR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    patientName: { type: Type.STRING },
    ageDob: { type: Type.STRING },
    gender: { type: Type.STRING },
    mrn: { type: Type.STRING },
    allergies: { type: Type.ARRAY, items: { type: Type.STRING } },
    currentMedications: { type: Type.ARRAY, items: { type: Type.STRING } },
    pastMedicalHistory: { type: Type.ARRAY, items: { type: Type.STRING } },
    recentVitals: { type: Type.ARRAY, items: { type: Type.STRING } },
    recentInvestigations: { type: Type.ARRAY, items: { type: Type.STRING } },
    currentDiagnosisOrReason: { type: Type.STRING },
    rawVisualSummary: { type: Type.STRING },
  },
  required: [
    'patientName',
    'allergies',
    'currentMedications',
    'pastMedicalHistory',
    'rawVisualSummary',
  ],
};
