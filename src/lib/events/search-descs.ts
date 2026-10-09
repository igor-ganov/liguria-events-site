import { descriptionOf } from './description-of.ts';
import { descriptionPlain } from '../description/description-plain.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Locale } from '../i18n/locales.ts';

/**
 * What a region hands its feeds' search: each event's description as plain
 * text in one language, keyed by event. A feed page does not carry these — a
 * third of its weight, for a search most readers never run — and fetches this
 * when the search box is first touched. An event with nothing written about it
 * is left out.
 */
export const searchDescs = (events: readonly CompactEvent[], region: string, lang: Locale): Readonly<Record<string, string>> =>
  Object.fromEntries(
    events
      .filter((event) => event.rg === region)
      .map((event): readonly [string, string] => [event.id, descriptionPlain(descriptionOf(lang)(event))])
      .filter(([, text]) => text !== ''),
  );
