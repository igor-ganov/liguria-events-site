/** The roadmap's stages, in the order a reader meets them: what is being built
 *  first, what has shipped last. */
export const STAGES = ['now', 'next', 'later', 'done'] as const;

export type Stage = (typeof STAGES)[number];
