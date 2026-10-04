import { branch } from '../branch.ts';
import { cityName } from '../region/city-name.ts';

/** The two strings a venue page's head needs, before the place is filled in. */
export type VenueSeoText = Readonly<{ venueTitle: string; venue: string }>;

/**
 * A venue page's title and description, naming the town.
 *
 * The queries that reach this site carry one — "due forni sestri levante" — and
 * the title carried only the venue's name. A venue whose name already contains
 * the town does not say it twice.
 */
export const venueSeo = (
  text: VenueSeoText,
  name: string,
  city: string,
): Readonly<{ title: string; description: string }> => {
  const town = cityName(city);
  const known = name.toLowerCase().includes(town.toLowerCase());
  // The town is dropped out of the sentence rather than substituted, so the
  // comma or the preposition in front of it goes with it.
  const fill = (template: string): string =>
    branch(known)(
      () => template.replaceAll('{place}', name).replace(/[\s,]*(?:in|a)?\s*\{city\}/u, ''),
      () => template.replaceAll('{place}', name).replaceAll('{city}', town),
    );
  return { title: fill(text.venueTitle), description: fill(text.venue) };
};
