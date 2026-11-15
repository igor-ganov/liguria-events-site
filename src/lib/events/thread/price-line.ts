import { LOCALE_TAG } from '../../i18n/locale-tag.ts';
import type { CompactEvent } from '../event-schema.ts';
import type { Locale } from '../../i18n/locales.ts';
import type { ThreadLabels } from './thread-labels.ts';

/** What it costs, in one phrase, and whether that phrase is "free". */
export type PriceLine = Readonly<{ text: string; free: boolean }>;

type Labels = Pick<ThreadLabels, 'free' | 'from' | 'priceUnknown'>;

const euro = (lang: Locale, amount: number): string =>
  new Intl.NumberFormat(LOCALE_TAG[lang], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

/** Free, from the cheapest ticket a source gave, or plainly not listed: a
 *  price nobody stated is not made up and not left as a blank. */
export const priceLine =
  (lang: Locale, labels: Labels) =>
  (event: CompactEvent): PriceLine =>
    [
      { when: event.f === true, line: { text: labels.free, free: true } },
      { when: event.pr !== undefined, line: { text: `${labels.from} ${euro(lang, event.pr ?? 0)}`, free: false } },
    ].find((rule) => rule.when)?.line ?? { text: labels.priceUnknown, free: false };
