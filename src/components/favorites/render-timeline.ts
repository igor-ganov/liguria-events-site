import { timelineDay } from './timeline-day.ts';
import type { RouteDay, RouteStop } from '../../lib/favorites/build-route.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Payload } from './payload-types.ts';

/** The whole route as day timelines. Stops are a single ordered column — each
 *  an absolutely-positioned block (top ∝ start, height ∝ duration). There are
 *  no lanes: dragging reorders the sequence. This only produces the markup; the
 *  drag/resize wiring lives in route-editor / init-route. */
export const renderTimeline = (
  days: readonly RouteDay[],
  payload: Payload,
  byId: ReadonlyMap<string, RouteStop>,
  lang: Locale,
  editable = false,
): string => days.map((day) => timelineDay(day, { payload, byId, lang, editable })).join('');
