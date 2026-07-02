import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { eventUrl } from '../../lib/event-url.ts';
import { formatWhen } from '../../lib/events/format-when.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import { primaryCategory } from '../../lib/events/primary-category.ts';
import { renderIcon } from './render-icon.ts';
import { renderTags } from './render-tags.ts';

const renderThumb = (event: CompactEvent): TemplateResult =>
  branch(event.img === undefined)(
    () => html`
      <div class="mini-thumb--empty" data-cat=${primaryCategory(event.c)}>
        ${renderIcon(primaryCategory(event.c), 26)}
      </div>
    `,
    () => html`<img class="mini-thumb" src=${event.img ?? ''} alt="" loading="lazy" />`,
  );

/** The mini event card — feed entries, ongoing list (design: click-through). */
export const renderMiniCard = (event: CompactEvent): TemplateResult => html`
  <li class="mini-card">
    ${renderThumb(event)}
    <div class="mini-body">
      <h4 class="mini-title"><a href=${eventUrl(event.id)}>${event.t}</a></h4>
      <span class="mini-when">${formatWhen(event)}</span>
      ${branch(event.d === undefined)(
        () => html``,
        () => html`<p class="mini-desc">${event.d}</p>`,
      )}
      ${renderTags(event)}
    </div>
  </li>
`;
