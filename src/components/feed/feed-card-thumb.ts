import { BRAND_MARK } from '../../lib/img/brand-mark.ts';
import { branch } from '../../lib/branch.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { largeCover } from '../../lib/img/large-cover.ts';
import { primaryCategory } from '../../lib/events/primary-category.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** The photograph the card is made of — or, when the event came with none, the
 *  mark of the site on its own ground. Never a stand-in picked by category:
 *  beside real photographs that reads as a picture chosen at random. */
export const feedCardThumb = (event: CompactEvent): string =>
  branch(event.img === undefined)(
    () => `<span class="photo-card-blank">${BRAND_MARK}</span>`,
    () =>
      `<img class="photo-card-pic" src="${escapeMarkup(largeCover(event.img ?? ''))}" alt="" data-cat="${primaryCategory(event.c)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`,
  );
