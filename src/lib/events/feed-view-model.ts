import { branch } from '../branch.ts';
import { feedDayGroups } from './feed-day-groups.ts';
import { feedEvents } from './feed-events.ts';
import { facetSeo } from './facet-seo.ts';
import { feedPath } from '../region/feed-path.ts';
import { feedTitle } from './feed-title.ts';
import { localizedUrl } from '../i18n/localized-url.ts';
import { placeLabel } from '../region/place-label.ts';
import { regionUrl } from '../region/region-url.ts';
import { venuePath } from './venue-path.ts';
import { venueSeo } from './venue-seo.ts';
import type { CompactEvent } from './event-schema.ts';
import type { FeedScope } from './feed-events.ts';
import type { Locale } from '../i18n/locales.ts';
import type { Ui } from '../i18n/ui-schema.ts';

type Input = Readonly<{ lang: Locale; scope: FeedScope; events: readonly CompactEvent[]; today: string; ui: Ui }>;

/**
 * What a feed page shows, derived in one place: which events, under what name,
 * at what path, and — when there are none — where to send the reader instead.
 *
 * "Nothing here" is an answer and gets a page; the site used to answer 404,
 * telling a visitor that a real city did not exist.
 */
export const feedViewModel = ({ lang, scope, events, today, ui }: Input) => {
  const shown = feedEvents(events, scope);
  const placeName = scope.venue?.name ?? placeLabel(scope.region, scope.city);
  const seo = facetSeo(scope, ui) ?? branch(scope.venue === undefined)(
    () => ({ title: feedTitle(ui, placeName), description: ui.seo.feed }),
    // A venue's head names its town: the queries that reach this site carry
    // one, and the title used to carry only the venue's name.
    () => venueSeo(ui.seo, placeName, scope.city ?? ''),
  );
  return {
    events: shown,
    groups: feedDayGroups(today)(shown),
    placeName,
    // Both halves take the place name; only the description used to, so a
    // facet page titled itself "What's on today in {place}".
    title: seo.title.replace('{place}', placeName),
    description: seo.description.replace('{place}', placeName),
    path: branch(scope.facet === undefined && scope.venue === undefined)(
      () => feedPath(scope.region, scope.city),
      () =>
        venuePath(scope.region, scope.city ?? '', scope.facet?.slug ?? scope.venue?.slug ?? ''),
    ),
    // A venue or a facet leads up to its city, a city up to its region.
    onward: branch(scope.facet === undefined && scope.venue === undefined)(
      () => regionUrl(lang, scope.region),
      () => localizedUrl(lang, `${scope.region}/${scope.city ?? ''}/`),
    ),
  };
};
