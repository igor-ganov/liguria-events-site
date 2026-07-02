import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { CATEGORIES } from '../../lib/events/categories.ts';
import { categoryEmoji } from '../../lib/events/category-emoji.ts';
import { categoryLabel } from '../../lib/events/category-label.ts';
import type { FeedHost } from './host.ts';

/** Toggle chips: aria-pressed carries the state for AT users (AC-4.4). */
export const renderChips = (host: FeedHost): TemplateResult => html`
  <div class="chips" role="group" aria-label="Filter by category">
    ${CATEGORIES.map(
      (category) => html`
        <button
          class="chip"
          aria-pressed=${host.selected.includes(category)}
          @click=${(): void => host.ctl.toggleCategory(category)}
        >
          ${categoryEmoji[category]} ${categoryLabel[category]}
        </button>
      `,
    )}
    <button class="chip chip--free" aria-pressed=${host.freeOnly} @click=${host.ctl.toggleFree}>
      🆓 Free only
    </button>
  </div>
`;
