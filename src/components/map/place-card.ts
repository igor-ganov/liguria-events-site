import { commonsImg } from '../../lib/img/commons-img.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { placeColor } from '../../lib/places/place-color.ts';
import { placeIcon } from '../../lib/places/place-icon.ts';
import { placePath } from '../../lib/places/place-path.ts';
import { placeSources } from '../../lib/places/place-sources.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { PlacePopup } from '../../lib/map/place-popup-html.ts';
import type { Place } from '../../lib/places/place-schema.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** Photo width a place card asks Commons for. */
const CARD_PX = 240;
// A compact teaser only — the detail page carries the full set of sources.
const CHIP_LIMIT = 3;

/** The card a place marker opens. Most places have no photo, so the category
 *  icon is the norm; the facts row is opening hours (raw OSM) plus the phone
 *  number (Overture/OSM, far better covered). */
export const placeCard =
  (lang: Locale, ui: Ui) =>
  (place: Place): PlacePopup => ({
    href: localizedUrl(lang, placePath(place.region, place.name, place.id)),
    image: place.img && commonsImg(place.img, CARD_PX),
    kindColor: placeColor(place.cat),
    kindIcon: placeIcon(place.cat, 13),
    kindLabel: ui.places.categories[place.cat] ?? place.cat,
    title: place.name,
    desc: place.desc,
    facts: {
      hours: place.hours,
      hoursLabel: ui.places.hours,
      hoursIcon: uiIcon('clock', 13),
      phone: place.phone,
      phoneLabel: ui.places.phone,
      phoneIcon: uiIcon('phone', 13),
    },
    sources: placeSources(place).slice(0, CHIP_LIMIT),
  });
