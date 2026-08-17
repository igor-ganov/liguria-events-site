import { PX_PER_MIN } from './px-per-min.ts';
import { axisSpan } from './axis-span.ts';
import { dayWindow } from './day-window.ts';
import { dayGaps } from './day-gaps.ts';
import { escHtml } from './esc-html.ts';
import { gmapsButton } from './gmaps-button.ts';
import { hourLines } from './hour-lines.ts';
import { hoursControl } from './hours-control.ts';
import { timelineBlock } from './timeline-block.ts';
import { timelineHours } from './timeline-hours.ts';
import { buildDaySchedule } from '../../lib/favorites/day-schedule.ts';
import { dayLabel } from '../../lib/favorites/day-label.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { DayCtx, TimelineOpts } from './timeline-types.ts';

/** One day as a vertical clock axis with its blocks, gaps and hour ruler. */
export const timelineDay = (day: RouteDay, opts: TimelineOpts): string => {
  const p = opts.payload;
  const hours = timelineHours(day.day, p);
  const bounds = dayWindow(hours);
  const items = buildDaySchedule(day.stops, p.mode, p.times, p.durations, p.pauses, bounds.startMin);
  const span = axisSpan(items, bounds);
  const ctx: DayCtx = { opts, day: day.day, start: span.start };
  return (
    `<section class="route-day"><h3>${escHtml(dayLabel(day.day, opts.lang))}${gmapsButton(day, p.mode)}${hoursControl(day.day, hours)}</h3>` +
    `<div class="tl-axis" data-tl-axis style="height:${(span.end - span.start) * PX_PER_MIN}px">` +
    `${hourLines(span.start, span.end)}${dayGaps(day, items, ctx)}` +
    `${items.map((item) => timelineBlock(item, ctx)).join('')}</div></section>`
  );
};
