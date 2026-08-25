import { regionUrl } from '../region/region-url.ts';
import type { UiIconName } from '../icons/ui-icon-paths.ts';
import type { Locale } from '../i18n/locales.ts';

/** One labelled section of the flying menu. */
export type MenuGroup = Readonly<{
  label: string;
  favourites: boolean;
  links: readonly Readonly<{ href: string; icon: UiIconName; label: string }>[];
}>;

/** The slice of the UI dictionary the menu reads — the full `Ui` satisfies it. */
export type MenuUi = Readonly<{
  menu: Readonly<{ events: string; explore: string; more: string }>;
  contribute: Readonly<{ link: string }>;
  nav: Readonly<{
    feed: string;
    calendar: string;
    map: string;
    landmarks: string;
    places: string;
    bot: string;
    ical: string;
  }>;
}>;

/**
 * Grouped into sub-categories so the menu reads as sections instead of one long
 * wall of links (and stays tidy on a small screen). Favourites is a personal
 * destination — it sits at the end of the first group with its heart + count.
 */
export const menuGroups = (lang: Locale, region: string, ui: MenuUi): readonly MenuGroup[] => [
  {
    label: ui.menu.events,
    favourites: true,
    links: [
      // First, and above the feed: making an event is what the site is for.
      { href: '/submit', icon: 'plus', label: ui.contribute.link },
      { href: regionUrl(lang, region), icon: 'feed', label: ui.nav.feed },
      { href: regionUrl(lang, region, 'calendar/'), icon: 'calendar', label: ui.nav.calendar },
      { href: regionUrl(lang, region, 'map/'), icon: 'map', label: ui.nav.map },
    ],
  },
  {
    label: ui.menu.explore,
    favourites: false,
    links: [
      { href: regionUrl(lang, region, 'landmarks/'), icon: 'pin', label: ui.nav.landmarks },
      { href: regionUrl(lang, region, 'places/'), icon: 'places', label: ui.nav.places },
    ],
  },
  {
    label: ui.menu.more,
    favourites: false,
    links: [
      { href: 'https://t.me/dovego_bot', icon: 'bot', label: ui.nav.bot },
      {
        href: 'https://liguria-events-bot.igor-ganov.workers.dev/calendar.ics',
        icon: 'ical',
        label: ui.nav.ical,
      },
    ],
  },
];
