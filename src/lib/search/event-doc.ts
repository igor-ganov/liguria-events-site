import { eventPath } from '../event-path.ts';
import { localizedUrl } from '../i18n/localized-url.ts';
import { titleOf } from '../events/title-of.ts';
import { descriptionOf } from '../events/description-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { Locale } from '../i18n/locales.ts';
import type { Ui } from '../i18n/ui-schema.ts';
import type { SearchDoc } from './doc.ts';

// Site glue (NOT part of the upstream library): projects an event onto the
// scorer's document model for the current locale. The venue/address ride in the
// description so "teatro carlo felice" finds the show; category names ride in
// the body so "музыка"/"concerto" reach an untitled listing.
const catNames = (ui: Ui) => (event: CompactEvent): string =>
  event.c.map((category) => ui.cat[category] ?? category).join(' ');

const join = (parts: readonly (string | undefined)[]): string =>
  parts.filter((part): part is string => Boolean(part)).join(' ');

export const eventToDoc =
  (lang: Locale, ui: Ui) =>
  (event: CompactEvent): SearchDoc => ({
    id: event.id,
    lang,
    section: 'event',
    url: localizedUrl(lang, eventPath(event.id)),
    title: titleOf(lang)(event),
    description: join([event.v, event.a]),
    body: join([descriptionOf(lang)(event), catNames(ui)(event), event.v, event.a]),
  });
