import { isDefined } from '../../lib/is-defined.ts';
import type { DateRange } from '../../lib/favorites/build-route.ts';

/** The trip window from the two date inputs. An absent end date leaves `to` OFF
 *  the object (not set to undefined), which is what an open-ended trip means. */
export const dateRange = (from: string, to: string | undefined): DateRange => ({
  from,
  ...[to].filter(isDefined).map((value) => ({ to: value })).at(0),
});
