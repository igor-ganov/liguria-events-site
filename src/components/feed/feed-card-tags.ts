import { escapeMarkup } from '../../lib/escape-markup.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** The card's category chips, glyph + localized label, in the event's own
 *  order. */
export const feedCardTags = (
  event: CompactEvent,
  ui: Ui,
  icons: Readonly<Record<string, string>>,
): string =>
  event.c
    .map(
      (cat) =>
        `<span class="cat-tag" data-cat="${cat}">${icons[cat] ?? ''} ${escapeMarkup(ui.cat[cat] ?? cat)}</span>`,
    )
    .join('');
