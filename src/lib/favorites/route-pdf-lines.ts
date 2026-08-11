// Pure layout model for the route PDF: turns the itinerary into a flat list of
// typed lines (title / day heading / stop / leg / base leg). Kept free of any
// PDF library or DOM so it is unit-testable; route-pdf.ts renders these lines.
import type { DayBase } from './base-point.ts';
import { legTo } from './base-point.ts';
import type { Leg, Mode, RouteDay, RouteStop } from './build-route.ts';
import { eventDuration, formatDuration } from './event-duration.ts';
import { titleOf } from '../events/title-of.ts';
import type { Locale } from '../i18n/locales.ts';

export type PdfLineKind = 'title' | 'day' | 'stop' | 'leg' | 'base';
export type PdfLine = Readonly<{ text: string; kind: PdfLineKind }>;

export type PdfLabels = Readonly<{ min: string; fromBase: string; toBase: string }>;
export type PdfOpts = Readonly<{
  title: string;
  lang: Locale;
  mode: Mode;
  durations: Readonly<Record<string, number>>;
  labels: PdfLabels;
  baseOf?: (day: string) => DayBase;
}>;

const km = (m: number): string => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);

const dayLabel = (iso: string, lang: Locale): string =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' });

const legDetail = (leg: Leg, opts: PdfOpts): string =>
  `${km(leg.meters)} · ${leg.minutes} ${opts.labels.min}` +
  (leg.transfers ? ` · ${leg.transfers}⇄` : '') +
  ` · ${opts.mode}`;

const stopText = (stop: RouteStop, n: number, opts: PdfOpts): string => {
  const time = stop.h ? `${stop.h}  ` : '';
  const venue = stop.v ? ` — ${stop.v}` : '';
  const dur = eventDuration(stop, opts.durations[stop.id]);
  return `${n}. ${time}${titleOf(opts.lang)(stop)}${venue}  (${formatDuration(dur)})`;
};

/** Flatten the itinerary into typed PDF lines. */
export const routePdfLines = (days: readonly RouteDay[], opts: PdfOpts): readonly PdfLine[] => {
  const lines: PdfLine[] = [{ text: opts.title, kind: 'title' }];
  let n = 0;
  for (const day of days) {
    lines.push({ text: dayLabel(day.day, opts.lang), kind: 'day' });
    const db = opts.baseOf?.(day.day);
    const first = day.stops[0]?.g;
    if (db?.base && first) lines.push({ text: `${opts.labels.fromBase} · ${legDetail(legTo([db.base.lat, db.base.lng], first, opts.mode), opts)}`, kind: 'base' });
    day.stops.forEach((stop, i) => {
      n += 1;
      if (i > 0) lines.push({ text: legDetail(day.legs[i - 1]!, opts), kind: 'leg' });
      lines.push({ text: stopText(stop, n, opts), kind: 'stop' });
    });
    const last = day.stops.at(-1)?.g;
    const end = db?.final ?? db?.base;
    if (end && last) lines.push({ text: `${opts.labels.toBase} · ${legDetail(legTo(last, [end.lat, end.lng], opts.mode), opts)}`, kind: 'base' });
  }
  return lines;
};
