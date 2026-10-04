import { durationText } from './duration-text.ts';
import { LOCALE_TAG } from '../i18n/locale-tag.ts';
import { whenTile } from './when-tile.ts';
import type { CompactEvent } from './event-schema.ts';
import type { EventTile } from './event-tile.ts';
import type { Locale } from '../i18n/locales.ts';

type Labels = Readonly<{ starts: string; dates: string; duration: string; price: string }>;
type Input = Readonly<{ event: CompactEvent; lang: Locale; labels: Labels }>;

// A tile for a fact we hold, and none for one we do not.
const held = <Fact,>(fact: Fact | undefined, make: (value: Fact) => EventTile): readonly EventTile[] =>
  [fact].filter((value): value is Fact => value !== undefined).map(make);

// A programme is counted in days: two starts on one evening are one date.
const dayCount = (event: CompactEvent): number | undefined =>
  [new Set((event.p ?? []).map((session) => session.date)).size].find((count) => count > 1);

const euro = (lang: Locale, amount: number): string =>
  new Intl.NumberFormat(LOCALE_TAG[lang], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

/**
 * The facts of an event as tiles, always in one order: when, the hour, how
 * many dates, how long, from how much. Most sources give two of the five, and
 * the page shows two tiles then — never a placeholder for the other three.
 */
export const eventTiles = ({ event, lang, labels }: Input): readonly EventTile[] => [
  whenTile(event, lang),
  ...held(event.h, (hour) => ({ key: 'starts', icon: 'clock', value: hour, label: labels.starts })),
  ...held(dayCount(event), (count) => ({ key: 'dates', icon: 'layers', value: String(count), label: labels.dates })),
  ...held(event.du, (minutes) => ({ key: 'duration', icon: 'timer', value: durationText(lang, minutes), label: labels.duration })),
  ...held(event.pr, (amount) => ({ key: 'price', icon: 'euro', value: euro(lang, amount), label: labels.price })),
];
