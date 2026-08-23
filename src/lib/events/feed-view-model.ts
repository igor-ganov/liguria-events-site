import { branch } from '../branch.ts';
import { feedDayGroups } from './feed-day-groups.ts';
import { feedEvents } from './feed-events.ts';
import { feedPath } from '../region/feed-path.ts';
import { localizedUrl } from '../i18n/localized-url.ts';
import { placeLabel } from '../region/place-label.ts';
import { regionUrl } from '../region/region-url.ts';
import { venuePath } from './venue-path.ts';
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
  const seo = branch(scope.venue === undefined)(
    () => ({ title: `${placeName} — ${ui.nav.feed}`, description: ui.seo.feed }),
    () => ({ title: ui.seo.venueTitle.replace('{place}', placeName), description: ui.seo.venue }),
  );
  return {
    events: shown,
    groups: feedDayGroups(today)(shown),
    placeName,
    title: seo.title,
    description: seo.description.replace('{place}', placeName),
    path: branch(scope.venue === undefined)(
      () => feedPath(scope.region, scope.city),
      () => venuePath(scope.region, scope.city ?? '', scope.venue?.slug ?? ''),
    ),
    // A venue leads up to its city, a city up to its region.
    onward: branch(scope.venue === undefined)(
      () => regionUrl(lang, scope.region),
      () => localizedUrl(lang, `${scope.region}/${scope.city ?? ''}/`),
    ),
  };
};
