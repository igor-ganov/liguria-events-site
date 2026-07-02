import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { formatWhen } from '../../lib/events/format-when.ts';
import { ongoingInMonth } from '../../lib/events/ongoing-in-month.ts';
import { renderEventLink } from '../shared/render-event-link.ts';
import type { CalendarHost } from './host.ts';

/** Long-running exhibitions/seasons for the displayed month (AC-2.3). */
export const renderOngoing = (host: CalendarHost): TemplateResult => {
  const ongoing = ongoingInMonth(host.monthKey)(host.events);
  return branch(ongoing.length === 0)(
    () => html``,
    () => html`
      <section class="ongoing">
        <h3>Ongoing this month</h3>
        <ul class="ongoing-list">
          ${ongoing.map(
            (event) => html`
              <li>${renderEventLink(event)} <span class="feed-when">${formatWhen(event)}</span></li>
            `,
          )}
        </ul>
      </section>
    `,
  );
};
