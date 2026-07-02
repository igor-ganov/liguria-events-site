import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { Category } from '../../lib/events/categories.ts';
import { ICON_PATHS } from '../../lib/icons/icon-paths.ts';

/** Lit wrapper over the shared icon set (safe: paths are our own constants). */
export const renderIcon = (category: Category, size = 16): TemplateResult => html`
  <svg
    class="cat-icon"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    ${unsafeSVG(ICON_PATHS[category])}
  </svg>
`;
