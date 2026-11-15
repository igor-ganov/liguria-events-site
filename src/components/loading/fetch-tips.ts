import { tipsUrl } from '../../lib/loading/tips-url.ts';
import type { Tip } from '../../lib/loading/tip.ts';

/** The tips of a language from the site, or from the worker when offline.
 *  Low priority: it must never compete with the page being loaded. The decoder
 *  is imported here, not at the top: it carries the schema library, and loading
 *  feedback that is on every page must not put that on any page's first load. */
export const fetchTips = async (lang: string): Promise<readonly Tip[]> => {
  const answer = await fetch(tipsUrl(lang), { priority: 'low' }).catch(() => undefined);
  const body: unknown = await answer?.json().catch(() => undefined);
  const { decodeTips } = await import('../../lib/loading/decode-tips.ts');
  return decodeTips(body);
};
