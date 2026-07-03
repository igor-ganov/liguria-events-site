import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { monthGrid } from '../../lib/calendar/month-grid.ts';
import { monthTitle } from '../../lib/calendar/month-title.ts';
import { renderDay } from './render-day.ts';
import { renderOngoing } from './render-ongoing.ts';
import type { CalendarHost } from './host.ts';

export const renderCalendar = (host: CalendarHost): TemplateResult => {
  const title = monthTitle(host.ui)(host.monthKey);
  return html`
    <header class="cal-head">
      <button class="nav-btn" @click=${host.ctl.prev} aria-label=${host.ui.calNav.prev}>‹</button>
      <h2>${title}</h2>
      <button class="nav-btn" @click=${host.ctl.next} aria-label=${host.ui.calNav.next}>›</button>
    </header>
    <div class="cal-grid" role="grid" aria-label=${title}>
      ${host.ui.weekdays.map(
        (name) => html`<div class="cal-weekday" role="columnheader">${name}</div>`,
      )}
      ${monthGrid(host.monthKey).flat().map(renderDay(host))}
    </div>
    ${renderOngoing(host)}
  `;
};
