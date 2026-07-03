import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { CATEGORIES } from '../../lib/events/categories.ts';
import { renderIcon } from '../shared/render-icon.ts';
import type { FeedHost } from './host.ts';

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
  </div>
`;
