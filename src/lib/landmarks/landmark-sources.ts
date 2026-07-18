import type { Landmark } from './landmark-schema.ts';

/** A named outbound link shown under the detail page's Sources section. */
export type LandmarkSource = Readonly<{ name: string; url: string }>;

// OSM ids are `osm:node/123` / `osm:way/45` → the element's page on osm.org.
const osmUrl = (id: string): string | undefined =>
  id.startsWith('osm:') ? `https://www.openstreetmap.org/${id.slice(4)}` : undefined;

/** Where a landmark's information comes from — Wikipedia first (the description),
 *  then the structured records. Wikipedia is a source here, not the destination. */
export const landmarkSources = (l: Landmark): readonly LandmarkSource[] =>
  [
    l.wiki ? { name: 'Wikipedia', url: l.wiki } : undefined,
    l.wd ? { name: 'Wikidata', url: l.wd } : undefined,
    osmUrl(l.id) ? { name: 'OpenStreetMap', url: osmUrl(l.id) as string } : undefined,
  ].filter((s): s is LandmarkSource => s !== undefined);
