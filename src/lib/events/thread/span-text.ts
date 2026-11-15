import { LOCALE_TAG } from '../../i18n/locale-tag.ts';
import type { CompactEvent } from '../event-schema.ts';
import type { Locale } from '../../i18n/locales.ts';

const at = (iso: string): Date => new Date(`${iso}T00:00:00Z`);

/** "15 Nov – 3 Dec" for an event that owns a span of days; nothing for one
 *  that is on a single day. */
export const spanText = (lang: Locale, event: CompactEvent): string | undefined =>
  [event.e ?? event.s]
    .filter((end) => end > event.s)
    .map((end) => new Intl.DateTimeFormat(LOCALE_TAG[lang], { day: 'numeric', month: 'short', timeZone: 'UTC' }).formatRange(at(event.s), at(end)))
    .at(0);
