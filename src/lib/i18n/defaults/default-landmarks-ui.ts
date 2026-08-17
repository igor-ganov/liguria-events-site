import type { Ui } from '../ui-schema.ts';

/** English landmarks copy for the #ui-data safety net. */
export const DEFAULT_LANDMARKS_UI: Ui['landmarks'] = {
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
};
