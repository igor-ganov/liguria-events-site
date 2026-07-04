import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { CATEGORIES } from '../../lib/events/categories.ts';
import { branch } from '../../lib/branch.ts';
import { renderIcon } from '../shared/render-icon.ts';
import type { FeedHost } from './host.ts';

/** The clear-selection chip only exists while at least one filter is active. */
const renderClear = (host: FeedHost): TemplateResult =>
  branch(host.selected.length > 0 || host.freeOnly || host.gemsOnly)(
    () => html`
      <button class="chip chip--clear" @click=${host.ctl.clearFilters}>
        ✕ ${host.ui.chips.clear}
      </button>
    `,
    () => html``,
  );

/** Toggle chips: aria-pressed carries the state for AT users (AC-4.4). */
export const renderChips = (host: FeedHost): TemplateResult => html`
  <div class="chips" role="group" aria-label="Filter by category">
    ${CATEGORIES.map(
      (category) => html`
        <button
          class="chip"
          data-cat=${category}
          aria-pressed=${host.selected.includes(category)}
          @click=${(): void => host.ctl.toggleCategory(category)}
        >
          ${renderIcon(category, 14)} ${host.ui.cat[category]}
        </button>
      `,
    )}
    <button class="chip chip--free" aria-pressed=${host.freeOnly} @click=${host.ctl.toggleFree}>
      ${host.ui.chips.free}
    </button>
    <button class="chip chip--gems" aria-pressed=${host.gemsOnly} @click=${host.ctl.toggleGems}>
      ${host.ui.chips.gems}
    </button>
    ${renderClear(host)}
  </div>
`;
