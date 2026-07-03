import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { dayHeading } from '../../lib/calendar/day-heading.ts';
import { filterByCategories } from '../../lib/events/filter-by-categories.ts';
import { filterFreeOnly } from '../../lib/events/filter-free-only.ts';
import { filterGemsOnly } from '../../lib/events/filter-gems-only.ts';
import { groupByDay } from '../../lib/events/group-by-day.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import { renderChips } from './render-chips.ts';
import { renderMiniCard } from '../shared/render-mini-card.ts';
import type { FeedHost } from './host.ts';

const renderGroup =
  (host: FeedHost) =>
  ([day, events]: readonly [string, readonly CompactEvent[]]): TemplateResult =>
    html`
      <section class="feed-group">
        <h3>${dayHeading(host.ui)(day)}</h3>
        <ul class="feed-list">
          ${events.map((event) => renderMiniCard(event, host.ui, host.locale))}
        </ul>
      </section>
    `;

export const renderFeed = (host: FeedHost): TemplateResult => {
  const filtered = filterGemsOnly(host.gemsOnly)(
    filterFreeOnly(host.freeOnly)(filterByCategories(new Set(host.selected))(host.events)),
  );
  const groups = [...groupByDay(host.today)(filtered).entries()];
  return html`
    ${renderChips(host)}
    ${branch(groups.length === 0)(
      () => html`<p class="feed-empty">${host.ui.empty}</p>`,
      () => html`${groups.map(renderGroup(host))}`,
    )}
  `;
};
