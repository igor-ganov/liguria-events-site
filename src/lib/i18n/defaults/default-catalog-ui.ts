import type { Ui } from '../ui-schema.ts';

/** English category and date names for the #ui-data safety net. */
export const DEFAULT_CATALOG_UI: Pick<Ui, 'cat' | 'weekdays' | 'months'> = {
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
};
