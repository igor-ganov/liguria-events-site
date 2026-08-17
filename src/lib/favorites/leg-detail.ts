import { distanceLabel } from './distance-label.ts';
import type { Leg } from './build-route.ts';
import type { PdfOpts } from './pdf-line-types.ts';

/** One travel leg as a line: '1.2 km · 15 min · 1⇄ · transit'. */
export const legDetail = (leg: Leg, opts: PdfOpts): string =>
  `${distanceLabel(leg.meters)} · ${leg.minutes} ${opts.labels.min}` +
  ((leg.transfers && ` · ${leg.transfers}⇄`) || '') +
  ` · ${opts.mode}`;
