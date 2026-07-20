import type { Place } from './place-schema.ts';

/** A named outbound link shown on the place card / detail page. */
export type PlaceSource = Readonly<{ name: string; url: string }>;

const osmUrl = (id: string): string | undefined =>
  id.startsWith('osm:') ? `https://www.openstreetmap.org/${id.slice(4)}` : undefined;

const socialName = (url: string): string =>
  /instagram\.com/i.test(url) ? 'Instagram' : /facebook\.com|fb\.com/i.test(url) ? 'Facebook' : 'Social';

// We can't store third-party ratings (Google/Tripadvisor licenses forbid it), so
// instead we LINK to their search for this place — reviews open there, nothing is
// cached. Both, since coverage differs by venue.
const reviewLinks = (p: Place): readonly PlaceSource[] => {
  const q = encodeURIComponent(`${p.name} ${p.lat},${p.lng}`);
  return [
    { name: 'Reviews · Maps', url: `https://www.google.com/maps/search/?api=1&query=${q}` },
    { name: 'Tripadvisor', url: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(p.name)}` },
  ];
};

/** Actionable links + provenance for a place: its own site & socials first, then
 *  where to read reviews, then the open records it was built from. */
export const placeSources = (p: Place): readonly PlaceSource[] =>
  [
    p.website ? { name: 'Website', url: p.website } : undefined,
    ...(p.socials ?? []).map((url) => ({ name: socialName(url), url })),
    ...reviewLinks(p),
    p.wiki ? { name: 'Wikipedia', url: p.wiki } : undefined,
    p.wd ? { name: 'Wikidata', url: p.wd } : undefined,
    osmUrl(p.id) ? { name: 'OpenStreetMap', url: osmUrl(p.id) as string } : undefined,
    p.id.startsWith('ovt:') ? { name: 'Overture Maps', url: 'https://overturemaps.org/' } : undefined,
  ].filter((s): s is PlaceSource => s !== undefined);
