import { addPauseButton } from './add-pause-button.ts';
import { pauseBlock } from './pause-block.ts';
import { travelChip } from './travel-chip.ts';
import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';
import type { DayCtx } from './timeline-types.ts';

/** Everything drawn in the space between two blocks: the travel chip, any
 *  manual break, and the add-a-pause button. */
export const timelineGap = (
  item: ScheduledStop,
  prevId: string,
  prevEnd: number,
  ctx: DayCtx,
): string =>
  travelChip(item, prevEnd, ctx) +
  pauseBlock(prevId, prevEnd + item.travelMin, ctx.opts.payload.pauses[prevId] ?? 0, ctx) +
  addPauseButton(prevId, prevEnd, ctx);
