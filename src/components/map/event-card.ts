import { eventPath } from '../../lib/event-path.ts';
import { formatWhen } from '../../lib/events/format-when.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { EventPopup } from '../../lib/map/event-popup-html.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

/** The four fields every event card on the map is built from — a lone marker's
 *  popup and one row of a cluster popup render exactly the same data. */
export const eventCard =
  (lang: Locale) =>
  (event: CompactEvent): EventPopup => ({
    href: localizedUrl(lang, eventPath(event)),
    image: event.img,
    title: titleOf(lang)(event),
    when: formatWhen(event),
  });
