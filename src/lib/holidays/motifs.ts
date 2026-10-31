/** The decorations a holiday may wear. The AI job picks one by name; the
 *  drawings are ours (motif-paths.ts), so the model never supplies markup. */
export const MOTIFS = [
  'pumpkin',
  'bat',
  'leaf',
  'star',
  'snowflake',
  'heart',
  'confetti',
  'flower',
  'sun',
  'none',
] as const;

export type Motif = (typeof MOTIFS)[number];
