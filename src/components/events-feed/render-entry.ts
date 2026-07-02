import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { formatWhen } from '../../lib/events/format-when.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import { renderEventLink } from '../shared/render-event-link.ts';

export const renderEntry = (event: CompactEvent): TemplateResult => html`
  <li class="feed-entry">
    ${renderEventLink(event)}
    <span class="feed-when">${formatWhen(event)}</span>
    ${branch(event.f === true)(
      () => html`<span class="badge-free">free</span>`,
      () => html``,
    )}
  </li>
`;
