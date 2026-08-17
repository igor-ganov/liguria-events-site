import { entriesOf } from './entries-of.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { asPoint } from '../../lib/favorites/base-point.ts';
import type { Point } from '../../lib/favorites/base-point.ts';

/** Stored per-day points (bases or finals); unreadable ones are dropped. */
export const asPointMap = (value: unknown): Readonly<Record<string, Point>> =>
  Object.fromEntries(
    entriesOf(value).flatMap(([day, raw]) =>
      [asPoint(raw)].filter(isDefined).map((point): readonly [string, Point] => [day, point]),
    ),
  );
