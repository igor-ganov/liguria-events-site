import { favButtonHtml } from '../favorites/fav-button.ts';
import { landmarkPath } from './landmark-path.ts';
import { localizedUrl } from '../i18n/localized-url.ts';
import type { Landmark } from './landmark-schema.ts';
import type { Locale } from '../i18n/locales.ts';

/** The heart toggle for a landmark detail page. The favourite carries what the
 *  favourites page / route builder need to render this POI without re-loading
 *  its region shard. */
export const landmarkFavHtml =
  (lang: Locale, label: string) =>
  (item: Landmark): string =>
    favButtonHtml(item.id, label, {
      id: item.id, kind: 'landmark', region: item.region, name: item.name,
      lat: item.lat, lng: item.lng, cat: item.kind,
      url: localizedUrl(lang, landmarkPath(item.region, item.name, item.id)),
    });
