import { branch } from '../branch.ts';
import { canonicalUrl } from './canonical-url.ts';
import { ENTRY_LOCALE } from '../i18n/entry-locale.ts';
import { llmsLine } from './llms-line.ts';
import { regionsOf } from '../region/regions-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

const listed = (count: number): string =>
  `${count} ${branch(count === 1)(() => 'event', () => 'events')} listed`;

/** The regions with something on, busiest first — `regionsOf` sorts them, and
 *  an empty one is no more worth a model's attention than a crawler's. */
export const regionLines = (
  events: readonly CompactEvent[],
  site: URL | undefined,
): readonly string[] =>
  regionsOf(events)
    .filter((region) => region.count > 0)
    .map((region) =>
      llmsLine(region.name, canonicalUrl(ENTRY_LOCALE, `${region.slug}/`, site), listed(region.count)),
    );
