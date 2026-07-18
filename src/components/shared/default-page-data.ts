import type { PageData } from '../../lib/i18n/ui-schema.ts';

/** English safety net if the #ui-data island is missing/malformed (never
 *  expected — the island is always embedded). */
export const DEFAULT_PAGE_DATA: PageData = {
  lang: 'en',
  ui: {
    nav: { calendar: 'Calendar', feed: 'Feed', map: 'Map', landmarks: 'Landmarks', bot: 'Telegram bot', ical: 'iCal' },
    search: { placeholder: 'Search events…', none: 'No events match your search.' },
    mapLayers: { events: 'Events', landmarks: 'Landmarks' },
    landmarks: {
      title: 'Landmarks',
      intro: 'Places worth seeing across Liguria, gathered from Wikipedia and OpenStreetMap.',
      more: 'Read on Wikipedia',
      empty: 'No landmarks match.',
      search: 'Search landmarks…',
      kinds: {
        castle: 'Castles', church: 'Churches', museum: 'Museums', palace: 'Palaces',
        monument: 'Monuments', tower: 'Towers', lighthouse: 'Lighthouses', square: 'Squares',
        park: 'Parks', heritage: 'Heritage sites', beach: 'Beaches', attraction: 'Attractions',
      },
    },
    chips: { free: 'Free only', gems: 'Hidden gems', clear: 'Clear' },
    theme: { toggle: 'Toggle colour theme', light: 'Light', dark: 'Dark', system: 'System' },
    range: { from: 'From', to: 'To' },
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
    badges: { free: 'free', gem: 'gem' },
    empty: 'Nothing matches these filters yet.',
    footer: '',
    photoBy: 'photo',
    summaryNote: '',
    mapLink: 'View on map',
  },
};
