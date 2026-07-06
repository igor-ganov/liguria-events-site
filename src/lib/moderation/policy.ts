// Single source of truth for the content rules — rendered as prose on the
// Content Policy page and handed to the AI moderator as its rubric. The SAME
// rules apply to user-submitted AND crawler-ingested events.

export const POLICY_VERSION = '2026-07-06';

export const PROHIBITED: readonly string[] = [
  'Extremist, terrorist or violent content, or praise, support or promotion of such.',
  'Hateful or discriminatory content that attacks or demeans people based on race, ethnicity, national origin, religion, gender, sexual orientation, disability, age or similar protected characteristics.',
  'Racist or xenophobic content.',
  'Harassment, threats, bullying or incitement to hatred or violence.',
  'Sexual or sexually explicit content, or content endangering minors.',
  'Illegal activity, or the facilitation or promotion of it.',
  'Scams, deceptive schemes, spam, or deliberately misleading information.',
  'Impersonation, or infringing someone else’s intellectual-property or privacy rights.',
];

/** Compact rubric string for the AI moderator prompt. */
export const policyRubric = (): string =>
  `Prohibited on this events platform:\n${PROHIBITED.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
