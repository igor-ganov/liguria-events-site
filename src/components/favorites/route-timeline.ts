// Renders the day timeline (vertical clock axis) from the pure day-schedule
// model. Each stop is an absolutely-positioned block (top ∝ start, height ∝
// duration); overlapping stops share the day in separate lanes and turn red.
// The drag/resize wiring lives in route-editor; this only produces the markup,
// carrying each block's current start/duration in data-* for the drag maths.
import { assignLanes, axisRange, buildDaySchedule, timeOfMinutes } from '../../lib/favorites/day-schedule.ts';
import { eventDuration } from '../../lib/favorites/event-duration.ts';
import type { RouteDay, RouteStop } from '../../lib/favorites/build-route.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import { dayLabel, esc } from './route-render.ts';
import type { Payload } from './route-payload.ts';

export const PX_PER_MIN = 1.1;
export const DAY_START_MIN = 9 * 60; // 09:00 — the timeline's default opening hour

const hourLines = (start: number, end: number): string => {
  const lines: string[] = [];
  for (let m = start; m <= end; m += 60) {
    lines.push(`<div class="tl-hour" style="top:${(m - start) * PX_PER_MIN}px"><span>${timeOfMinutes(m)}</span></div>`);
  }
  return lines.join('');
};

const dayHtml = (day: RouteDay, payload: Payload, byId: ReadonlyMap<string, RouteStop>, lang: Locale): string => {
  const items = buildDaySchedule(day.stops, payload.mode, payload.times, payload.durations, DAY_START_MIN);
  const { start, end } = axisRange(items, DAY_START_MIN);
  const { lane, count } = assignLanes(items);
  const height = (end - start) * PX_PER_MIN;
  const blocks = items
    .map((it) => {
      const event = byId.get(it.id);
      const top = (it.startMin - start) * PX_PER_MIN;
      const h = Math.max(20, (it.endMin - it.startMin) * PX_PER_MIN);
      const width = 100 / count;
      const left = (lane[it.id] ?? 0) * width;
      const dur = event ? eventDuration(event, payload.durations[it.id]) : it.endMin - it.startMin;
      const title = event ? esc(titleOf(lang)(event)) : esc(it.id);
      return (
        `<div class="tl-block${it.overlap ? ' tl-block--overlap' : ''}" data-tl-id="${esc(it.id)}" ` +
        `data-tl-start="${it.startMin}" data-tl-dur="${dur}" ` +
        `style="top:${top}px;height:${h}px;left:${left}%;width:calc(${width}% - 4px)">` +
        `<span class="tl-time">${timeOfMinutes(it.startMin)}–${timeOfMinutes(it.endMin)}</span>` +
        `<span class="tl-title">${title}</span>` +
        `<span class="tl-resize" data-tl-resize aria-hidden="true"></span>` +
        `</div>`
      );
    })
    .join('');
  return (
    `<section class="route-day"><h3>${esc(dayLabel(day.day, lang))}</h3>` +
    `<div class="tl-axis" data-tl-axis style="height:${height}px">${hourLines(start, end)}${blocks}</div></section>`
  );
};

export const renderTimeline = (
  days: readonly RouteDay[],
  payload: Payload,
  byId: ReadonlyMap<string, RouteStop>,
  lang: Locale,
): string => days.map((day) => dayHtml(day, payload, byId, lang)).join('');
