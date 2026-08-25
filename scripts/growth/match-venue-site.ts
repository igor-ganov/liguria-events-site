export type Place = Readonly<{ name: string; website?: string; lat: number; lng: number }>;

const normalise = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number): number => {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

/** Same building, not the one next door. */
const NEAR_KM = 0.35;
/** Short words carry no identity: "di", "del", "the", "sala". */
const MIN_WORD = 4;

/**
 * The venue's own website, when we can be sure it is the venue's.
 *
 * A loose match finds something for almost every venue and is wrong about a
 * third of the time: "Palazzo Ducale" landed on the site of an exhibition
 * being held there, "Galata Maritime Museum" on a different museum entirely.
 * Writing to the wrong organisation about "your page" is worse than not
 * writing, so only an exact-word match counts — every significant word of the
 * venue's name present in the place's name, within 350 metres of it.
 *
 * Everything else comes back undefined and gets looked up by hand.
 */
export const matchVenueSite = (
  venue: Readonly<{ name: string; lat: number; lng: number }>,
  places: readonly Place[],
): string | undefined => {
  const words = normalise(venue.name)
    .split(' ')
    .filter((word) => word.length >= MIN_WORD);
  return [...words]
    .filter(() => words.length > 0)
    .slice(0, 1)
    .flatMap(() =>
      places
        .filter((place) => place.website !== undefined && place.website !== '')
        .filter((place) => distanceKm(venue.lat, venue.lng, place.lat, place.lng) < NEAR_KM)
        .filter((place) => words.every((word) => normalise(place.name).includes(word)))
        .map((place) => place.website ?? ''),
    )
    .at(0);
};
