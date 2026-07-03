import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';
import { renderIcon } from './render-icon.ts';

/** Icon+label tag per category, plus free/gem badges (localized). */
export const renderTags = (event: CompactEvent, ui: Ui): TemplateResult => html`
  <div class="mini-tags">
    ${event.c.map(
      (category) => html`
        <span class="cat-tag" data-cat=${category}>
          ${renderIcon(category, 12)} ${ui.cat[category]}
        </span>
      `,
    )}
    ${branch(event.f === true)(
      () => html`<span class="badge-free">${ui.badges.free}</span>`,
      () => html``,
    )}
    ${branch(event.x === true)(
      () => html`<span class="badge-gem">${ui.badges.gem}</span>`,
      () => html``,
    )}
  </div>
`;
