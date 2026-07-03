import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { ongoingInMonth } from '../../lib/events/ongoing-in-month.ts';
import { renderMiniCard } from '../shared/render-mini-card.ts';
import type { CalendarHost } from './host.ts';

/** Long-running exhibitions/seasons for the displayed month (AC-2.3). */
export const renderOngoing = (host: CalendarHost): TemplateResult => {
  const ongoing = ongoingInMonth(host.monthKey)(host.events);
  return branch(ongoing.length === 0)(
    () => html``,
    () => html`
      <section class="ongoing">
        <h3>${host.ui.headings.ongoing}</h3>
        <ul class="ongoing-list">
          ${ongoing.map((event) => renderMiniCard(event, host.ui, host.locale))}
        </ul>
      </section>
    `,
  );
};
