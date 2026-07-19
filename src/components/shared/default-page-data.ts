import type { PageData } from '../../lib/i18n/ui-schema.ts';

/** English safety net if the #ui-data island is missing/malformed (never
 *  expected — the island is always embedded). */
export const DEFAULT_PAGE_DATA: PageData = {
  lang: 'en',
  ui: {
    nav: { calendar: 'Calendar', feed: 'Feed', map: 'Map', landmarks: 'Landmarks', places: 'Places', bot: 'Telegram bot', ical: 'iCal' },
    search: { placeholder: 'Search events…', none: 'No events match your search.' },
    mapLayers: { events: 'Events', landmarks: 'Landmarks', places: 'Places' },
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
    places: {
      title: 'Places',
      intro: 'Where to go in Liguria — restaurants, bars, museums, gyms, entertainment and more.',
      empty: 'No places match.',
      search: 'Search places…',
      hours: 'Opening hours',
      rating: 'Rating',
      categories: {
        restaurant: 'Restaurants', cafe: 'Cafés', bar: 'Bars', fastfood: 'Fast food',
        icecream: 'Ice cream', nightlife: 'Nightlife', fitness: 'Fitness', climbing: 'Climbing',
        sport: 'Sport', cinema: 'Cinemas', entertainment: 'Entertainment', museum: 'Museums',
        gallery: 'Galleries', wellness: 'Wellness & spa', kids: 'Kids', shopping: 'Shopping',
      },
    },
    map: { retry: 'Retry', failed: "The map couldn't load — check your connection.", locate: 'Find my location' },
    auth: {
      signIn: 'Sign in', title: 'Sign in to Dove Go',
      emailPrompt: "Enter your email — we'll send you a sign-in link and a code.",
      sendCode: 'Send me a code', or: 'or', passkey: 'Sign in with a passkey',
      codePre: 'Enter the 6-digit code we sent to', codePost: '— or click the link in the email.',
      verify: 'Verify code', back: 'Use a different email', signOut: 'Sign out', addEvent: 'Add event',
      moderation: 'Moderation', users: 'Users', addPasskey: 'Add a passkey',
      sending: 'Sending…', invalidEmail: 'Please enter a valid email.', verifying: 'Verifying…',
      badCode: 'That code is wrong or has expired.', lookingPasskey: 'Looking for a passkey…',
      waitingPasskey: 'Waiting for your passkey…', passkeyFailed: 'Passkey sign-in failed — use your email instead.',
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
