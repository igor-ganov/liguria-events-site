import type { PlaceSource } from './place-source.ts';
import type { Place } from './place-schema.ts';

/** We can't store third-party ratings (Google/Tripadvisor licenses forbid it),
 *  so instead we LINK to their search for this place — reviews open there,
 *  nothing is cached. Both, since coverage differs by venue. */
export const reviewLinks = (p: Place): readonly PlaceSource[] => {
  const q = encodeURIComponent(`${p.name} ${p.lat},${p.lng}`);
  return [
    { name: 'Reviews · Maps', url: `https://www.google.com/maps/search/?api=1&query=${q}` },
    { name: 'Tripadvisor', url: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(p.name)}` },
  ];
};
