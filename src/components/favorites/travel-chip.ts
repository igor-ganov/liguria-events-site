import { PX_PER_MIN } from './px-per-min.ts';
import { hiddenText } from './hidden-text.ts';
import { when } from './when.ts';
import { formatDuration } from '../../lib/favorites/event-duration.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { UiIconName } from '../../lib/icons/ui-icon-paths.ts';
import type { Mode } from '../../lib/favorites/build-route.ts';
import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';
import type { DayCtx } from './timeline-types.ts';

// The timeline is English-only, like its other controls.
const GLYPH: Readonly<Record<Mode, Readonly<{ icon: UiIconName; name: string }>>> = {
  driving: { icon: 'car', name: 'Driving' },
  transit: { icon: 'bus', name: 'Transit' },
  walking: { icon: 'walk', name: 'Walking' },
};

/** The gap before a stop is its travel time. Fill it with a small mode-aware
 *  chip so the dead space between blocks reads as "walk/ride N min". */
export const travelChip = (item: ScheduledStop, prevEnd: number, ctx: DayCtx): string => {
  const top = (prevEnd + item.travelMin / 2 - ctx.start) * PX_PER_MIN;
  const glyph = GLYPH[ctx.opts.payload.mode];
  return when(
    item.travelMin >= 1,
    `<div class="tl-gap" style="top:${top}px">${uiIcon(glyph.icon, '1em')}${hiddenText(glyph.name)} ` +
      `${formatDuration(Math.round(item.travelMin))}</div>`,
  );
};
