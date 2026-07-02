import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { categoryLabel } from '../../lib/events/category-label.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import { renderIcon } from './render-icon.ts';

/** Icon+label tag per category, plus the free badge (AC: multi-category). */
export const renderTags = (event: CompactEvent): TemplateResult => html`
  <div class="mini-tags">
    ${event.c.map(
      (category) => html`
        <span class="cat-tag" data-cat=${category}>
          ${renderIcon(category, 12)} ${categoryLabel[category]}
        </span>
      `,
    )}
    ${branch(event.f === true)(
      () => html`<span class="badge-free">free</span>`,
      () => html``,
    )}
    ${branch(event.x === true)(
      () => html`<span class="badge-gem">💎 gem</span>`,
      () => html``,
    )}
  </div>
`;
