import { canonicalUrl } from './canonical-url.ts';
import { cityLines } from './llms-city-lines.ts';
import { ENTRY_LOCALE } from '../i18n/entry-locale.ts';
import { llmsAbout } from './llms-about.ts';
import { llmsLine } from './llms-line.ts';
import { monthKeyOf } from '../calendar/month-key-of.ts';
import { regionLines } from './llms-region-lines.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/**
 * The whole of /llms.txt: what the site is, what may be done with it, and the
 * pages worth reaching for — in the Italian addresses, which are the canonical
 * ones.
 *
 * Plain text at the host root, the convention the answer engines look for.
 */
export const llmsText = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): string =>
  [
    ...llmsAbout(events.length),
    '',
    '## Start here',
    '',
    llmsLine('Dove Go', canonicalUrl(ENTRY_LOCALE, '', site), 'the front page, which asks where the reader is'),
    llmsLine(
      'This month',
      canonicalUrl(ENTRY_LOCALE, `calendar/${monthKeyOf(today)}/`, site),
      'every event in the country, by day',
    ),
    llmsLine('Map', canonicalUrl(ENTRY_LOCALE, 'map/', site), 'the same events placed'),
    llmsLine('Venues', canonicalUrl(ENTRY_LOCALE, 'venues/', site), 'the places with a programme'),
    '',
    '## Regions',
    '',
    ...regionLines(events, site),
    '',
    '## Cities',
    '',
    ...cityLines(events, site),
    '',
    '## Machine-readable',
    '',
    llmsLine('Sitemap index', new URL('/sitemap-index.xml', site).toString(), 'every page offered, with lastmod'),
    '',
  ].join('\n');
