import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { dayHeading } from '../../lib/calendar/day-heading.ts';
import { dayKindOf } from '../../lib/calendar/day-kind.ts';
import type { DayKind } from '../../lib/calendar/day-kind.ts';
import { eventUrl } from '../../lib/event-url.ts';
import { dayCellEvents } from '../../lib/events/day-cell-events.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import { primaryCategory } from '../../lib/events/primary-category.ts';
import { renderIcon } from '../shared/render-icon.ts';
import type { CalendarHost } from './host.ts';

const DAY_CLASS: Readonly<Record<DayKind, string>> = {
  out: 'cal-day cal-day--out',
  today: 'cal-day cal-day--today',
  in: 'cal-day',
};

const renderPill = (event: CompactEvent): TemplateResult => html`
  <li>
    <a
      class="cal-pill"
      data-cat=${primaryCategory(event.c)}
      href=${eventUrl(event.id)}
      title=${event.t}
    >
      ${renderIcon(primaryCategory(event.c), 12)}
      <span>${event.t}</span>
    </a>
  </li>
`;

export const renderDay =
  (host: CalendarHost) =>
  (day: string): TemplateResult => html`
    <div class=${DAY_CLASS[dayKindOf(host.monthKey, host.today)(day)]} role="gridcell">
      <span class="cal-num">${Number(day.slice(8, 10))}</span>
      <span class="cal-day-label">${dayHeading(day)}</span>
      <ul class="cal-events">
        ${dayCellEvents(day)(host.events).map(renderPill)}
      </ul>
    </div>
  `;
