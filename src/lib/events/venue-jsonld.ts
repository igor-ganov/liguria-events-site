import { canonicalUrl } from '../seo/canonical-url.ts';
import { cityName } from '../region/city-name.ts';
import { eventPath } from '../event-path.ts';
import { regionName } from '../region/region-name.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Locale } from '../i18n/locales.ts';

type Params = Readonly<{
  name: string;
  city: string;
  region: string;
  url: string;
  events: readonly CompactEvent[];
  lang: Locale;
  site: URL | undefined;
}>;

// The same escape event-jsonld.ts uses: a '<' inside a ld+json body would end
// the script element early, whatever it is part of.
const LT = '\\u003c';

const eventLd = (lang: Locale, site: URL | undefined) => (event: CompactEvent) => ({
  '@type': 'Event',
  name: event.t,
  startDate: event.s,
  url: canonicalUrl(lang, eventPath(event), site),
});

/**
 * The venue page as a place, with what is on there.
 *
 * Until this, a venue page carried only the site-wide WebSite and Organization
 * markup — nothing said the page was about a place at all, and nothing tied the
 * events listed on it to it. Of 96 venue pages sampled in a week, none were in
 * the index, while a place page that is in it ranks tenth for its own name.
 */
export const venueJsonLd = (params: Params): string => {
  const { name, city, region, url, events, lang, site } = params;
  const place = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name,
    url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName(city),
      addressRegion: regionName(region),
      addressCountry: 'IT',
    },
    ...Object.fromEntries(
      [events].filter((list) => list.length > 0).map((list) => ['event', list.map(eventLd(lang, site))]),
    ),
  };
  return JSON.stringify(place).replace(/</g, LT);
};
