import { DEFAULT_AUTH_UI } from './default-auth-ui.ts';
import { DEFAULT_CATALOG_UI } from './default-catalog-ui.ts';
import { DEFAULT_LANDMARKS_UI } from './default-landmarks-ui.ts';
import { DEFAULT_PLACES_UI } from './default-places-ui.ts';
import { DEFAULT_ROUTE_UI } from './default-route-ui.ts';
import type { Ui } from '../ui-schema.ts';

/** The English strings every page falls back to. The sections that carry their
 *  own vocabulary (landmarks, places, sign-in, itineraries, categories) live in
 *  sibling modules; what is left is small enough to read in one screen. */
export const DEFAULT_UI: Ui = {
  nav: { calendar: 'Calendar', feed: 'Feed', map: 'Map', landmarks: 'Landmarks', places: 'Places', favorites: 'Favourites', bot: 'Telegram bot', ical: 'iCal' },
  search: { placeholder: 'Search events…', none: 'No events match your search.' },
  mapLayers: { events: 'Events', landmarks: 'Landmarks', places: 'Places' },
  landmarks: DEFAULT_LANDMARKS_UI,
  places: DEFAULT_PLACES_UI,
  reviews: {
    title: 'Reviews', none: 'No reviews yet — be the first.', rating: 'Your rating',
    comment: 'Add a comment (optional)', submit: 'Post review',
    signIn: 'Sign in to leave a review', remove: 'Remove', yours: 'Your review',
  },
  map: { retry: 'Retry', failed: "The map couldn't load — check your connection.", locate: 'Find my location' },
  auth: DEFAULT_AUTH_UI,
  chips: { free: 'Free only', gems: 'Hidden gems', clear: 'Clear' },
  theme: { toggle: 'Toggle colour theme', light: 'Light', dark: 'Dark', system: 'System' },
  range: { from: 'From', to: 'To' },
  sort: { label: 'Sort', date: 'By date', created: 'Newest first' },
  route: DEFAULT_ROUTE_UI,
  menu: { events: "What's on", explore: 'Explore', more: 'More' },
  seo: {
    feed: "Events and what's on in {place} — concerts, exhibitions, markets and more.",
    calendar: "Event calendar for {place} — what's on, day by day.",
    map: "Map of events in {place} — find what's on near you.",
  },
  ...DEFAULT_CATALOG_UI,
  headings: { ongoing: 'Ongoing this month', sources: 'Sources', allEvents: 'All events' },
  calNav: { prev: 'Previous month', next: 'Next month' },
  badges: { free: 'free', gem: 'gem' },
  empty: 'Nothing matches these filters yet.',
  footer: '',
  photoBy: 'photo',
  passedNote: 'This event has already taken place. The page is kept so the link keeps working.',
  summaryNote: '',
  mapLink: 'View on map',
  tickets: 'Buy tickets',
};
