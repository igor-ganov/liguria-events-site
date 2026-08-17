import type { Ui } from '../ui-schema.ts';

/** English places copy for the #ui-data safety net. */
export const DEFAULT_PLACES_UI: Ui['places'] = {
  title: 'Places',
  intro: 'Where to go in Liguria — restaurants, bars, museums, gyms, entertainment and more.',
  empty: 'No places match.',
  search: 'Search places…',
  hours: 'Opening hours',
  rating: 'Rating',
  phone: 'Phone',
  address: 'Address',
  categories: {
    restaurant: 'Restaurants', cafe: 'Cafés', bar: 'Bars', fastfood: 'Fast food',
    icecream: 'Ice cream', nightlife: 'Nightlife', fitness: 'Fitness', climbing: 'Climbing',
    sport: 'Sport', cinema: 'Cinemas', entertainment: 'Entertainment', museum: 'Museums',
    gallery: 'Galleries', wellness: 'Wellness & spa', kids: 'Kids', shopping: 'Shopping',
  },
};
