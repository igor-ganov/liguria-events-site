import { branch } from '../branch.ts';
import { dateSpan } from './date-span.ts';
import { LOCALE_TAG } from '../i18n/locale-tag.ts';
import type { CompactEvent } from './event-schema.ts';
import type { EventTile } from './event-tile.ts';
import type { Locale } from '../i18n/locales.ts';

const monthOf = (lang: Locale, iso: string): string =>
  new Intl.DateTimeFormat(LOCALE_TAG[lang], { month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

const dayOf = (iso: string): string => String(Number(iso.slice(8, 10)));

const tile = (value: string, label: string): EventTile => ({ key: 'when', icon: 'calendar', value, label });

/**
 * When it is, as the figure a reader looks for: the day under its month, two
 * days when the run stays inside one month, and both dates under the year when
 * it does not — a month name cannot caption a run that crosses two.
 */
export const whenTile = (event: CompactEvent, lang: Locale): EventTile => {
  const end = event.e ?? event.s;
  return branch(end === event.s)(
    () => tile(dayOf(event.s), monthOf(lang, event.s)),
    () =>
      branch(end.slice(0, 7) === event.s.slice(0, 7))(
        () => tile(`${dayOf(event.s)}–${dayOf(end)}`, monthOf(lang, event.s)),
        () => tile(dateSpan(event), event.s.slice(0, 4)),
      ),
  );
};
