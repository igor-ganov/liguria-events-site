import type { Ui } from '../ui-schema.ts';

/** English category and date names for the #ui-data safety net. */
export const DEFAULT_CATALOG_UI: Pick<Ui, 'cat' | 'weekdays' | 'months' | 'monthsIn' | 'lead'> = {
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
  // English capitalises its months wherever they stand, so these are the same
  // twelve words. Italian and Russian are not so lucky.
  monthsIn: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  lead: {
    line: '{place}, {window}: {events} — {cats}.',
    events: { one: '1 event coming up', other: '{n} events coming up' },
    now: 'Today: {today}. This weekend: {weekend}.',
  },
};
