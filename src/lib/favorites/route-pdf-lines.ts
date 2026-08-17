// Pure layout model for the route PDF: turns the itinerary into a flat list of
// typed lines (title / day heading / stop / leg / base leg). Kept free of any
// PDF library or DOM so it is unit-testable; route-pdf.ts renders these lines.
// The per-line producers live one per file next to this one.
import { dayPdfLines } from './day-pdf-lines.ts';
import type { RouteDay } from './build-route.ts';
import type { PdfLine, PdfOpts } from './pdf-line-types.ts';

export type { PdfLine, PdfLineKind, PdfLabels, PdfOpts } from './pdf-line-types.ts';

const stopsBefore = (days: readonly RouteDay[], index: number): number =>
  days.slice(0, index).reduce((n, day) => n + day.stops.length, 0);

/** Flatten the itinerary into typed PDF lines. */
export const routePdfLines = (days: readonly RouteDay[], opts: PdfOpts): readonly PdfLine[] => {
  const title: PdfLine = { text: opts.title, kind: 'title' };
  return [title, ...days.flatMap((day, i) => dayPdfLines(opts, stopsBefore(days, i))(day))];
};
