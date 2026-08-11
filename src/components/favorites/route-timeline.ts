// Renders the day timeline (vertical clock axis) from the pure day-schedule
// model. Stops are a single ordered column — each an absolutely-positioned block
// (top ∝ start, height ∝ duration). There are no lanes: dragging reorders the
// sequence. A fixed-time stop whose block sticks out of the event's official
// window turns red, with its real window shown as a hint. The drag/resize wiring
// lives in route-editor / init-route; this only produces the markup, carrying
// each block's current duration in data-* for the drag maths.
import { axisRange, buildDaySchedule, minutesOfTime, officialWindow, timeOfMinutes } from '../../lib/favorites/day-schedule.ts';
import { eventDuration, formatDuration } from '../../lib/favorites/event-duration.ts';
import { effectiveDayHours, readGlobalDayHours } from '../../lib/favorites/day-hours.ts';
import type { RouteDay, RouteStop } from '../../lib/favorites/build-route.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import { dayLabel, esc } from './route-render.ts';
import type { Payload } from './route-payload.ts';

export const PX_PER_MIN = 0.9;
export const DAY_START_MIN = 9 * 60; // 09:00 — the timeline's default opening hour

const hourLines = (start: number, end: number): string => {
  const lines: string[] = [];
  for (let m = start; m <= end; m += 60) {
    lines.push(`<div class="tl-hour" style="top:${(m - start) * PX_PER_MIN}px"><span>${timeOfMinutes(m)}</span></div>`);
  }
  return lines.join('');
};

const dayHtml = (day: RouteDay, payload: Payload, byId: ReadonlyMap<string, RouteStop>, lang: Locale, editable: boolean): string => {
  // Effective day window: per-day override → this route's setting → global → default.
  const routeHours = payload.dayStart !== '' && payload.dayEnd !== '' ? { start: payload.dayStart, end: payload.dayEnd } : undefined;
  const hours = effectiveDayHours(day.day, payload.dayHours, routeHours, readGlobalDayHours());
  const dayStartMin = minutesOfTime(hours.start) ?? DAY_START_MIN;
  const dayEndMin = minutesOfTime(hours.end) ?? 22 * 60;
  const items = buildDaySchedule(day.stops, payload.mode, payload.times, payload.durations, payload.pauses, dayStartMin);
  const range = axisRange(items, dayStartMin);
  const start = range.start;
  const end = Math.max(range.end, Math.ceil(dayEndMin / 60) * 60); // extend the axis to the day end
  const height = (end - start) * PX_PER_MIN;
  const hoursCtl =
    `<span class="tl-day-hours no-print">` +
    `<input type="time" class="tl-hour-input" data-day-start data-day="${esc(day.day)}" value="${esc(hours.start)}" aria-label="day start" />` +
    `–<input type="time" class="tl-hour-input" data-day-end data-day="${esc(day.day)}" value="${esc(hours.end)}" aria-label="day end" /></span>`;
  const blocks = items
    .map((it) => {
      const event = byId.get(it.id);
      const top = (it.startMin - start) * PX_PER_MIN;
      const h = Math.max(28, (it.endMin - it.startMin) * PX_PER_MIN);
      const dur = event ? eventDuration(event, payload.durations[it.id]) : it.endMin - it.startMin;
      const title = event ? esc(titleOf(lang)(event)) : esc(it.id);
      // When off-schedule, surface the real window the block has drifted out of.
      const win = event ? officialWindow(event) : undefined;
      const flag =
        it.offSchedule && win
          ? `<span class="tl-flag" aria-label="Runs ${timeOfMinutes(win.start)}–${timeOfMinutes(win.end)}">${timeOfMinutes(win.start)}–${timeOfMinutes(win.end)}</span>`
          : '';
      const pinned = payload.times[it.id] !== undefined;
      return (
        `<div class="tl-block${it.offSchedule ? ' tl-block--offschedule' : ''}${pinned ? ' tl-block--pinned' : ''}" data-tl-id="${esc(it.id)}" data-tl-day="${esc(day.day)}" ` +
        `data-tl-start="${it.startMin}" data-tl-dur="${dur}" style="top:${top}px;height:${h}px">` +
        `<span class="tl-resize tl-resize--top no-print" data-tl-resize="top" aria-hidden="true"></span>` +
        `<span class="tl-time">${timeOfMinutes(it.startMin)}–${timeOfMinutes(it.endMin)}${pinned ? ' 📌' : ''}</span>` +
        `<span class="tl-title">${title}</span>` +
        flag +
        (editable ? `<button type="button" class="tl-del no-print" data-tl-del data-tl-id="${esc(it.id)}" aria-label="Remove from route">✕</button>` : '') +
        `<span class="tl-resize tl-resize--bottom no-print" data-tl-resize="bottom" aria-hidden="true"></span>` +
        `</div>`
      );
    })
    .join('');
  // The gap before a stop is its travel time (the sequence starts each stop at
  // the previous end + travel). Fill it with a small mode-aware chip so the dead
  // space between blocks reads as "walk/ride N min", not emptiness.
  const glyph = payload.mode === 'driving' ? '🚗' : payload.mode === 'transit' ? '🚌' : '🚶';
  const gaps = items
    .map((it, i) => {
      if (i === 0) return '';
      const prevId = day.stops[i - 1]!.id;
      const prevEnd = items[i - 1]!.endMin;
      const pauseMin = payload.pauses[prevId] ?? 0;
      const parts: string[] = [];
      if (it.travelMin >= 5) {
        const top = (prevEnd + it.travelMin / 2 - start) * PX_PER_MIN;
        parts.push(`<div class="tl-gap" style="top:${top}px">${glyph} ${formatDuration(Math.round(it.travelMin))}</div>`);
      }
      if (pauseMin > 0) {
        const top = (prevEnd + it.travelMin + pauseMin / 2 - start) * PX_PER_MIN;
        parts.push(
          `<div class="tl-gap tl-gap--pause" style="top:${top}px" data-clear-pause data-after="${esc(prevId)}" data-day="${esc(day.day)}" role="button" tabindex="0" title="Remove pause">⏸ ${formatDuration(pauseMin)}</div>`,
        );
      }
      // A "+" droplet at the junction to drop a standard 1-hour break here.
      const top = (it.startMin - start) * PX_PER_MIN;
      parts.push(`<button type="button" class="tl-add-pause no-print" data-add-pause data-after="${esc(prevId)}" data-day="${esc(day.day)}" style="top:${top}px" aria-label="Add a 1-hour pause">+</button>`);
      return parts.join('');
    })
    .join('');
  return (
    `<section class="route-day"><h3>${esc(dayLabel(day.day, lang))}${hoursCtl}</h3>` +
    `<div class="tl-axis" data-tl-axis style="height:${height}px">${hourLines(start, end)}${gaps}${blocks}</div></section>`
  );
};

export const renderTimeline = (
  days: readonly RouteDay[],
  payload: Payload,
  byId: ReadonlyMap<string, RouteStop>,
  lang: Locale,
  editable = false,
): string => days.map((day) => dayHtml(day, payload, byId, lang, editable)).join('');
