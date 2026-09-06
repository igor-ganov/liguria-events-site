import { FROM_CACHE_ATTRIBUTE } from '../../sw/from-cache-attribute.ts';
import { stalenessParts } from '../../lib/pwa/staleness-parts.ts';
import type { Staleness } from '../../lib/pwa/staleness-parts.ts';

/** Where this page came from and, if it came off the device, how old it is. */
export type PageState = Readonly<{ from: 'network' | 'store'; age: Staleness | undefined }>;

/**
 * Read off the document element, where the worker wrote it before the page
 * painted. Not from `navigator.onLine`, and not from a message: a page has to
 * be able to say what it is showing the instant it is shown.
 */
export const pageState = (nowMs: number): PageState => {
  const stamp = Number(document.documentElement.getAttribute(FROM_CACHE_ATTRIBUTE) ?? '');
  return [stamp]
    .filter((at) => Number.isFinite(at) && at > 0)
    .map((at): PageState => ({ from: 'store', age: stalenessParts(at, nowMs) }))
    .at(0) ?? { from: 'network', age: undefined };
};
