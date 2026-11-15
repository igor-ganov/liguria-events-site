import { cityName } from '../../region/city-name.ts';
import { localizedUrl } from '../../i18n/localized-url.ts';
import type { CompactEvent } from '../event-schema.ts';
import type { Locale } from '../../i18n/locales.ts';

type Words = Readonly<{ eventPage: Readonly<{ allInCity: string }> }>;

/** The place the "what else is on" list is named after — the town, or the
 *  region when the event has no town — and the town's page, when it has one. */
export type TownOnward = Readonly<{ place: string; onward: Readonly<{ href: string; label: string }> | undefined }>;

export const townOnward = (lang: Locale, event: CompactEvent, ui: Words): TownOnward => {
  const town = [event.ct ?? ''].filter((city) => city !== '').map(cityName).at(0);
  return {
    place: town ?? event.rg ?? '',
    onward: [event.ct ?? '']
      .filter((city) => city !== '')
      .map((city) => ({ href: localizedUrl(lang, `${event.rg ?? ''}/${city}/`), label: ui.eventPage.allInCity.replace('{place}', cityName(city)) }))
      .at(0),
  };
};
