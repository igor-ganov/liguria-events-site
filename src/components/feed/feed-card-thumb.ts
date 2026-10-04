import { branch } from '../../lib/branch.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { largeCover } from '../../lib/img/large-cover.ts';
import { primaryCategory } from '../../lib/events/primary-category.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** The photograph the card is made of, or a field in the colour of its
 *  category carrying the glyph when the event has none. */
export const feedCardThumb = (
  event: CompactEvent,
  icons: Readonly<Record<string, string>>,
): string => {
  const cat = primaryCategory(event.c);
  return branch(event.img === undefined)(
    () => `<span class="photo-card-blank" data-cat="${cat}">${icons[cat] ?? ''}</span>`,
    () =>
      `<img class="photo-card-pic" src="${escapeMarkup(largeCover(event.img ?? ''))}" alt="" data-cat="${cat}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`,
  );
};
