import { mapEvents } from '../../lib/events/map-events.ts';
import { mapState } from './map-state.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** The events the map draws right now: the page's whole set run through the
 *  SAME date / category / free / gem pipeline the feed uses, so the two views
 *  can never disagree about what is on. */
export const shownEvents = (events: readonly CompactEvent[]): readonly CompactEvent[] =>
  mapEvents(
    mapState.from,
    mapState.to,
    [...mapState.selected],
    mapState.freeOnly,
    mapState.gemsOnly,
  )(events);
