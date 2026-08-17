import { PX_PER_MIN } from './px-per-min.ts';
import { when } from './when.ts';
import { formatDuration } from '../../lib/favorites/event-duration.ts';
import type { Mode } from '../../lib/favorites/build-route.ts';
import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';
import type { DayCtx } from './timeline-types.ts';

const GLYPH: Readonly<Record<Mode, string>> = { driving: '🚗', transit: '🚌', walking: '🚶' };

/** The gap before a stop is its travel time. Fill it with a small mode-aware
 *  chip so the dead space between blocks reads as "walk/ride N min". */
export const travelChip = (item: ScheduledStop, prevEnd: number, ctx: DayCtx): string => {
  const top = (prevEnd + item.travelMin / 2 - ctx.start) * PX_PER_MIN;
  return when(
    item.travelMin >= 1,
    `<div class="tl-gap" style="top:${top}px">${GLYPH[ctx.opts.payload.mode]} ${formatDuration(Math.round(item.travelMin))}</div>`,
  );
};
