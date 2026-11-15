import type { Tip } from '../../lib/loading/tip.ts';

/** The tips in hand for this page's language, where the rotation is, and the
 *  fetch still on its way, if one is. */
export const tipsStore: {
  lang: string;
  tips: readonly Tip[];
  cursor: number;
  pending: Promise<readonly Tip[]> | undefined;
} = { lang: '', tips: [], cursor: 0, pending: undefined };
