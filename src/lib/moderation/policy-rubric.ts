import { PROHIBITED } from './prohibited.ts';

/** Compact rubric string for the AI moderator prompt. */
export const policyRubric = (): string =>
  `Prohibited on this events platform:\n${PROHIBITED.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
