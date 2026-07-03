import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { eventPath } from '../../lib/event-path.ts';
import { descriptionOf } from '../../lib/events/description-of.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import { formatWhen } from '../../lib/events/format-when.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import { primaryCategory } from '../../lib/events/primary-category.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';
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

/** The whole mini-card links to the (localized) event page. */
export const renderMiniCard = (event: CompactEvent, ui: Ui, lang: Locale): TemplateResult => {
  const desc = descriptionOf(lang)(event);
  return html`
    <li>
      <a class="mini-card" href=${localizedUrl(lang, eventPath(event.id))}>
        ${renderThumb(event)}
        <div class="mini-body">
          <h4 class="mini-title">${titleOf(lang)(event)}</h4>
          <span class="mini-when">${formatWhen(event)}</span>
          ${branch(desc === '')(
            () => html``,
            () => html`<p class="mini-desc">${desc}</p>`,
          )}
          ${renderTags(event, ui)}
        </div>
      </a>
    </li>
  `;
};
