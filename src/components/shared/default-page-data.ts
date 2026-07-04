import type { PageData } from '../../lib/i18n/ui-schema.ts';

/** English safety net if the #ui-data island is missing/malformed (never
 *  expected — the island is always embedded). */
export const DEFAULT_PAGE_DATA: PageData = {
  lang: 'en',
  ui: {
    nav: { calendar: 'Calendar', feed: 'Feed', bot: 'Telegram bot', ical: 'iCal' },
    chips: { free: 'Free only', gems: '💎 Hidden gems', clear: 'Clear' },
    theme: { toggle: 'Toggle colour theme', light: 'Light', dark: 'Dark', system: 'System' },
    cat: {
      music: 'Music', theatre: 'Theatre', art: 'Art', food: 'Food', sport: 'Sport',
      family: 'Family', market: 'Markets', nightlife: 'Nightlife', culture: 'Culture',
      workshop: 'Workshops', other: 'Other',
    },
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    headings: { ongoing: 'Ongoing this month', sources: 'Sources', allEvents: 'All events' },
    calNav: { prev: 'Previous month', next: 'Next month' },
    badges: { free: 'free', gem: '💎 gem' },
    empty: 'Nothing matches these filters yet.',
    footer: '',
    photoBy: 'photo',
    summaryNote: '',
    mapLink: 'View on map',
  },
};
