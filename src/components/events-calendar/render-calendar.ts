import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { monthGrid } from '../../lib/calendar/month-grid.ts';
import { monthTitle } from '../../lib/calendar/month-title.ts';
import { WEEKDAYS } from '../../lib/calendar/weekdays.ts';
import { renderDay } from './render-day.ts';
import { renderOngoing } from './render-ongoing.ts';
import type { CalendarHost } from './host.ts';

export const renderCalendar = (host: CalendarHost): TemplateResult => html`
  <header class="cal-head">
    <button class="nav-btn" @click=${host.ctl.prev} aria-label="Previous month">‹</button>
    <h2>${monthTitle(host.monthKey)}</h2>
    <button class="nav-btn" @click=${host.ctl.next} aria-label="Next month">›</button>
  </header>
  <div class="cal-grid" role="grid" aria-label=${monthTitle(host.monthKey)}>
    ${WEEKDAYS.map((name) => html`<div class="cal-weekday" role="columnheader">${name}</div>`)}
    ${monthGrid(host.monthKey)
      .flat()
      .map(renderDay(host))}
  </div>
  ${renderOngoing(host)}
`;
