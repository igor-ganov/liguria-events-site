import { branch } from '../branch.ts';
import { canonicalUrl } from '../seo/canonical-url.ts';
import { venueJsonLd } from './venue-jsonld.ts';
import { venuesInCity } from './venues-in-city.ts';
import type { CityVenue } from './venues-in-city.ts';
import type { CompactEvent } from './event-schema.ts';
import type { FeedScope } from './feed-events.ts';
import type { Locale } from '../i18n/locales.ts';

type Input = Readonly<{
  lang: Locale;
  scope: FeedScope;
  corpus: readonly CompactEvent[];
  shown: readonly CompactEvent[];
  path: string;
  site: URL | undefined;
}>;

/**
 * The two things a feed page carries beside its list: the venues of a city, and
 * the markup that says a venue page is a place.
 *
 * Both answer the same reading — the queries that reach this site name venues,
 * 17 of 96 event pages sampled are in the index, and no venue page is. Kept out
 * of the component because a page template is a layout, not a derivation.
 */
export const feedExtras = ({ lang, scope, corpus, shown, path, site }: Input) => ({
  cityVenues: branch(
    scope.city !== undefined && scope.venue === undefined && scope.facet === undefined,
  )<readonly CityVenue[]>(
    () => venuesInCity(corpus, scope.region, scope.city ?? ''),
    () => [],
  ),
  venueLd: [scope.venue]
    .filter((found) => found !== undefined)
    .map((found) =>
      venueJsonLd({
        name: found.name,
        city: scope.city ?? '',
        region: scope.region,
        url: canonicalUrl(lang, path, site),
        events: shown,
        lang,
        site,
      }),
    )
    .at(0),
});
