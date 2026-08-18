import { queryAll } from '../../lib/dom/query-all.ts';
import type { HereTarget } from '../../lib/region/here-target.ts';

const isAnchor = (node: unknown): node is HTMLAnchorElement => node instanceof HTMLAnchorElement;

const selectorFor = (target: HereTarget): string =>
  [target.city]
    .filter((city) => city !== undefined)
    .map((city) => `.rp-city[data-region="${target.region}"][data-city="${city}"]`)
    .at(0) ?? `.rp-region[data-region="${target.region}"]`;

/**
 * The picker's own link for a resolved place, as a 0-or-1 array.
 *
 * Navigation reuses the server-rendered anchor rather than building a URL:
 * whatever the row links to — locale prefix, page segment, city filter — is
 * exactly where "use my city" should go, and the two can never drift apart.
 */
export const targetLink = (list: HTMLElement, target: HereTarget): readonly HTMLAnchorElement[] =>
  queryAll(list, selectorFor(target))
    .flatMap((row): readonly unknown[] => [row.querySelector('a')])
    .filter(isAnchor)
    .slice(0, 1);
