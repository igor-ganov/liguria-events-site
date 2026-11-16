import { distanceLabel } from './distance-label.ts';
import type { Leg } from './build-route.ts';
import type { PdfOpts } from './pdf-line-types.ts';

/** One travel leg as a line: '1.2 km · 15 min · Transfers: 1 · transit'. The
 *  PDF's built-in font has no arrows, so the transfer count is spelled out. */
export const legDetail = (leg: Leg, opts: PdfOpts): string =>
  `${distanceLabel(leg.meters)} · ${leg.minutes} ${opts.labels.min}` +
  ((leg.transfers && ` · ${opts.labels.transfers}: ${leg.transfers}`) || '') +
  ` · ${opts.mode}`;
