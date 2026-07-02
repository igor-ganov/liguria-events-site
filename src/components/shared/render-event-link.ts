import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { categoryEmoji } from '../../lib/events/category-emoji.ts';
import { categoryLabel } from '../../lib/events/category-label.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

export const renderEventLink = (event: CompactEvent): TemplateResult => html`
  <a href=${event.u} target="_blank" rel="noopener">
    <span aria-label=${categoryLabel[event.c]} title=${categoryLabel[event.c]}
      >${categoryEmoji[event.c]}</span
    >
    ${event.t}</a
  >
`;
