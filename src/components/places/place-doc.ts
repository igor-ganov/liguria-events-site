import type { SearchDoc } from '../../lib/search/index.ts';
import type { Place } from '../../lib/places/place-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** What the fuzzy scorer sees: the name carries the title weight, the category
 *  label stands in for a description, the blurb is the body. */
export const placeDoc =
  (lang: Locale, ui: Ui) =>
  (place: Place): SearchDoc => ({
    id: place.id,
    lang,
    section: 'page',
    url: '',
    title: place.name,
    description: ui.places.categories[place.cat] ?? place.cat,
    body: place.desc ?? '',
  });
