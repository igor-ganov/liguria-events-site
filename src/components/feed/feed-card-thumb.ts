import { branch } from '../../lib/branch.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { primaryCategory } from '../../lib/events/primary-category.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** The card's picture, or the category glyph when the event has none. */
export const feedCardThumb = (
  event: CompactEvent,
  icons: Readonly<Record<string, string>>,
): string => {
  const cat = primaryCategory(event.c);
  return branch(event.img === undefined)(
    () => `<div class="mini-thumb--empty" data-cat="${cat}">${icons[cat] ?? ''}</div>`,
    () =>
      `<img class="mini-thumb" src="${escapeMarkup(event.img ?? '')}" alt="" data-cat="${cat}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`,
  );
};
