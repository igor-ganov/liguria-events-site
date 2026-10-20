import { branch } from '../branch.ts';

/** The two headings the venue list can carry, before the place is filled in. */
export type VenuesHeadingText = Readonly<{ venuesHere: string; venuesAround: string }>;

/**
 * What to call the list of venue links: in a town, or across a region.
 *
 * Two strings rather than one with a `{place}` hole, because the preposition
 * declines with what follows it — "Luoghi a Genova" but "Luoghi in Liguria" —
 * and a region feed carries this list too since the city pages turned out to be
 * the tier Google barely reads.
 */
export const venuesHeading = (
  text: VenuesHeadingText,
  city: string | undefined,
  placeName: string,
): string =>
  branch(city === undefined)(
    () => text.venuesAround.replace('{place}', placeName),
    () => text.venuesHere.replace('{place}', placeName),
  );
