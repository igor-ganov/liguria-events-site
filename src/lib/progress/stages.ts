/** The roadmap's stages in the order the path is walked: what is behind us,
 *  where we stand, what lies ahead. */
export const STAGES = ['done', 'now', 'next', 'later'] as const;

export type Stage = (typeof STAGES)[number];
