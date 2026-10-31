import { feedPath } from '../region/feed-path.ts';
import { localizedUrl } from '../i18n/localized-url.ts';
import { quickOfSlug } from './quick-of-slug.ts';
import type { FeedScope } from '../events/feed-events.ts';
import type { Locale } from '../i18n/locales.ts';
import type { QuickKind } from './quick-kind.ts';

export type FeedQuickProps = Readonly<{ base: string; current: QuickKind | ''; toggle: boolean }>;

/**
 * How a feed page offers its quick filters: where its quick pages start (none
 * on a venue), which of them it is, and whether a chip filters it in place —
 * only a whole region or city feed holds every card a quick page would.
 */
export const feedQuickProps = (lang: Locale, scope: Omit<FeedScope, 'today'>): FeedQuickProps => ({
  base: [localizedUrl(lang, feedPath(scope.region, scope.city))].filter(() => scope.venue === undefined).at(0) ?? '',
  current: quickOfSlug(scope.facet?.slug ?? ''),
  toggle: scope.venue === undefined && scope.facet === undefined,
});
