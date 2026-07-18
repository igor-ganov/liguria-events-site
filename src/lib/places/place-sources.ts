import type { Place } from './place-schema.ts';

/** A named outbound link shown under the detail page's Sources section. */
export type PlaceSource = Readonly<{ name: string; url: string }>;

const osmUrl = (id: string): string | undefined =>
  id.startsWith('osm:') ? `https://www.openstreetmap.org/${id.slice(4)}` : undefined;

/** Where a place's information comes from: its own site first, then the open
 *  records. Google is intentionally absent — its data can't be stored/shown
 *  outside a Google map, so we don't build on it. */
export const placeSources = (p: Place): readonly PlaceSource[] =>
  [
    p.website ? { name: 'Website', url: p.website } : undefined,
    p.wiki ? { name: 'Wikipedia', url: p.wiki } : undefined,
    p.wd ? { name: 'Wikidata', url: p.wd } : undefined,
    osmUrl(p.id) ? { name: 'OpenStreetMap', url: osmUrl(p.id) as string } : undefined,
    p.id.startsWith('ovt:') ? { name: 'Overture Maps', url: 'https://overturemaps.org/' } : undefined,
  ].filter((s): s is PlaceSource => s !== undefined);
