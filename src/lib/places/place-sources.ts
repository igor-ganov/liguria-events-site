import { reviewLinks } from './review-links.ts';
import { socialName } from './social-name.ts';
import type { PlaceSource } from './place-source.ts';
import type { Place } from './place-schema.ts';

export type { PlaceSource } from './place-source.ts';

// A link is a 0-or-1 element list: an absent field contributes nothing, which
// the concatenation below drops without a filter pass.
const link = (name: string, url: string | undefined): readonly PlaceSource[] =>
  [url].filter((value): value is string => Boolean(value)).map((value) => ({ name, url: value }));

// OSM ids are `osm:node/123` / `osm:way/45` → the element's page on osm.org.
const osm = (id: string): readonly PlaceSource[] =>
  [id]
    .filter((value) => value.startsWith('osm:'))
    .map((value) => ({ name: 'OpenStreetMap', url: `https://www.openstreetmap.org/${value.slice(4)}` }));

// Overture-built places carry no per-record page — credit the project itself.
const overture = (id: string): readonly PlaceSource[] =>
  [id].filter((value) => value.startsWith('ovt:')).map(() => ({ name: 'Overture Maps', url: 'https://overturemaps.org/' }));

/** Actionable links + provenance for a place: its own site & socials first, then
 *  where to read reviews, then the open records it was built from. */
export const placeSources = (p: Place): readonly PlaceSource[] => [
  ...link('Website', p.website),
  ...(p.socials ?? []).map((url) => ({ name: socialName(url), url })),
  ...reviewLinks(p),
  ...link('Wikipedia', p.wiki),
  ...link('Wikidata', p.wd),
  ...osm(p.id),
  ...overture(p.id),
];
