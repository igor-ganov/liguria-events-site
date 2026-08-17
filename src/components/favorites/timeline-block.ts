import { PX_PER_MIN } from './px-per-min.ts';
import { blockDuration } from './block-duration.ts';
import { blockTitle } from './block-title.ts';
import { delButton } from './del-button.ts';
import { escHtml } from './esc-html.ts';
import { offScheduleFlag } from './off-schedule-flag.ts';
import { when } from './when.ts';
import { timeOfMinutes } from '../../lib/favorites/day-schedule.ts';
import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';
import type { DayCtx } from './timeline-types.ts';

const MIN_PX = 28;

/** One stop as an absolutely-positioned block (top ∝ start, height ∝ duration),
 *  carrying its current start/duration in data-* for the drag maths. */
export const timelineBlock = (item: ScheduledStop, ctx: DayCtx): string => {
  const { payload, byId, lang, editable } = ctx.opts;
  const event = byId.get(item.id);
  const pinned = payload.times[item.id] !== undefined;
  const height = Math.max(MIN_PX, (item.endMin - item.startMin) * PX_PER_MIN);
  return (
    `<div class="tl-block${when(item.offSchedule, ' tl-block--offschedule')}${when(pinned, ' tl-block--pinned')}"` +
    ` draggable="false" data-tl-id="${escHtml(item.id)}" data-tl-day="${escHtml(ctx.day)}" ` +
    `data-tl-start="${item.startMin}" data-tl-dur="${blockDuration(item, event, payload.durations)}" ` +
    `style="top:${(item.startMin - ctx.start) * PX_PER_MIN}px;height:${height}px">` +
    `<span class="tl-resize tl-resize--top no-print" data-tl-resize="top" aria-hidden="true"></span>` +
    `<span class="tl-grip no-print" data-tl-grip aria-hidden="true">⠿</span>` +
    `<span class="tl-time">${timeOfMinutes(item.startMin)}–${timeOfMinutes(item.endMin)}${when(pinned, ' 📌')}</span>` +
    `<span class="tl-title">${blockTitle(item, event, lang)}</span>` +
    offScheduleFlag(item, event) +
    delButton(item.id, editable) +
    `<span class="tl-resize tl-resize--bottom no-print" data-tl-resize="bottom" aria-hidden="true"></span>` +
    `</div>`
  );
};
