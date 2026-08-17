// One day of the itinerary, laid out into PDF lines: a heading, an optional leg
// from the base, the numbered stops with the legs between them, and an optional
// leg back.
import { legTo } from './base-point.ts';
import { dayLabel } from './day-label.ts';
import { legDetail } from './leg-detail.ts';
import { stopText } from './stop-text.ts';
import type { Point } from './base-point.ts';
import type { RouteDay, RouteStop } from './build-route.ts';
import type { PdfLine, PdfOpts } from './pdf-line-types.ts';

type Coord = readonly [number, number];

const coordOf = (point: Point): Coord => [point.lat, point.lng];

const baseLines = (label: string, from: Coord | undefined, to: Coord | undefined, opts: PdfOpts): readonly PdfLine[] => {
  const text = from && to && `${label} · ${legDetail(legTo(from, to, opts.mode), opts)}`;
  const line: PdfLine = { text: text || '', kind: 'base' };
  return (text && [line]) || [];
};

// The leg BEFORE a stop — none before the first one of the day.
const stopLines =
  (day: RouteDay, offset: number, opts: PdfOpts) =>
  (stop: RouteStop, i: number): readonly PdfLine[] => [
    ...day.legs.slice(Math.max(0, i - 1), i).map((leg): PdfLine => ({ text: legDetail(leg, opts), kind: 'leg' })),
    { text: stopText(stop, offset + i + 1, opts), kind: 'stop' },
  ];

/** Lay out one day. `offset` is how many stops the earlier days already used,
 *  so the numbering runs through the whole trip. */
export const dayPdfLines =
  (opts: PdfOpts, offset: number) =>
  (day: RouteDay): readonly PdfLine[] => {
    const base = opts.baseOf?.(day.day);
    const start = base?.base;
    const end = base?.final ?? base?.base;
    const heading: PdfLine = { text: dayLabel(day.day, opts.lang), kind: 'day' };
    return [
      heading,
      ...baseLines(opts.labels.fromBase, start && coordOf(start), day.stops[0]?.g, opts),
      ...day.stops.flatMap(stopLines(day, offset, opts)),
      ...baseLines(opts.labels.toBase, day.stops.at(-1)?.g, end && coordOf(end), opts),
    ];
  };
