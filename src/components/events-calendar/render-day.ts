import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { dayKindOf } from '../../lib/calendar/day-kind.ts';
import type { DayKind } from '../../lib/calendar/day-kind.ts';
import { dayCellEvents } from '../../lib/events/day-cell-events.ts';
import { renderEventLink } from '../shared/render-event-link.ts';
import type { CalendarHost } from './host.ts';

const DAY_CLASS: Readonly<Record<DayKind, string>> = {
  out: 'cal-day cal-day--out',
  today: 'cal-day cal-day--today',
  in: 'cal-day',
};

export const renderDay =
  (host: CalendarHost) =>
  (day: string): TemplateResult => html`
    <div class=${DAY_CLASS[dayKindOf(host.monthKey, host.today)(day)]} role="gridcell">
      <span class="cal-num">${Number(day.slice(8, 10))}</span>
      <ul class="cal-events">
        ${dayCellEvents(day)(host.events).map(
          (event) => html`<li>${renderEventLink(event)}</li>`,
        )}
      </ul>
    </div>
  `;
