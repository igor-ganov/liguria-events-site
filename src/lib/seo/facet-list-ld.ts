import { canonicalUrl } from './canonical-url.ts';
import { eventPath } from '../event-path.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { Locale } from '../i18n/locales.ts';

type Params = Readonly<{ name: string; events: readonly CompactEvent[]; lang: Locale; site: URL | undefined }>;

// A list is read for its first screen; past that it only weighs the page down.
const MAX_ITEMS = 30;
// The escape event-jsonld.ts uses: a '<' would end the script element early.
const LT = '\u003c';

/**
 * A facet page — tonight in Liguria, free in Genova — as the list it is: its
 * events in the order shown, each at its own address, where the event pages
 * carry the Event markup.
 */
export const facetListLd = ({ name, events, lang, site }: Params): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: events.slice(0, MAX_ITEMS).map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: canonicalUrl(lang, eventPath(event), site),
    })),
  }).replaceAll('<', LT);
