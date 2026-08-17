import { branch } from '../../lib/branch.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { placeColor } from '../../lib/places/place-color.ts';
import { placeIcon } from '../../lib/places/place-icon.ts';
import { placePath } from '../../lib/places/place-path.ts';
import { placeThumbHtml } from './place-thumb-html.ts';
import type { Place } from '../../lib/places/place-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

const descHtml = (place: Place): string =>
  branch((place.desc ?? '') === '')(
    () => '',
    () => `<p class="lm-desc">${escapeMarkup(place.desc ?? '')}</p>`,
  );

// The card links to the place's own detail page, sharing the landmark grid's
// markup (and therefore its stylesheet) down to the class names.
export const placeCardHtml =
  (lang: Locale, ui: Ui) =>
  (place: Place): string => {
    const href = localizedUrl(lang, placePath(place.region, place.name, place.id));
    const catLabel = ui.places.categories[place.cat] ?? place.cat;
    return (
      `<a class="lm-card" href="${escapeMarkup(href)}" style="--lm:${placeColor(place.cat)}">` +
      `<span class="lm-thumb">${placeThumbHtml(place)}</span>` +
      `<span class="lm-info"><span class="lm-name">${escapeMarkup(place.name)}</span>` +
      `<span class="lm-kind">${placeIcon(place.cat, 15)} ${escapeMarkup(catLabel)}</span>` +
      `${descHtml(place)}</span></a>`
    );
  };
