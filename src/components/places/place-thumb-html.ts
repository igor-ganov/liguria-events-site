import { branch } from '../../lib/branch.ts';
import { commonsImg } from '../../lib/img/commons-img.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { placeIcon } from '../../lib/places/place-icon.ts';
import type { Place } from '../../lib/places/place-schema.ts';

/** A place's photo, or its category icon when Commons has none. */
export const placeThumbHtml = (place: Place): string =>
  branch((place.img ?? '') === '')(
    () => `<span class="lm-thumb-icon" aria-hidden="true">${placeIcon(place.cat, 30)}</span>`,
    () =>
      `<img class="lm-thumb-img" src="${escapeMarkup(commonsImg(place.img ?? '', 400))}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`,
  );
