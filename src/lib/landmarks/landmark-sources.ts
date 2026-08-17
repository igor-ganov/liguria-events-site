import { truthy } from '../truthy.ts';
import type { Landmark } from './landmark-schema.ts';

/** A named outbound link shown under the detail page's Sources section. */
export type LandmarkSource = Readonly<{ name: string; url: string }>;

// OSM ids are `osm:node/123` / `osm:way/45` → the element's page on osm.org.
const OSM_PREFIX = 'osm:';
const osmUrl = (id: string): string | undefined =>
  [id]
    .filter((raw) => raw.startsWith(OSM_PREFIX))
    .map((raw) => `https://www.openstreetmap.org/${raw.slice(OSM_PREFIX.length)}`)
    .at(0);

// A 0-or-1 list, so an absent record contributes no row to the Sources section.
const sourceOf = (name: string, url: string | undefined): readonly LandmarkSource[] =>
  truthy(url).map((found) => ({ name, url: found }));

/** Where a landmark's information comes from — Wikipedia first (the description),
 *  then the structured records. Wikipedia is a source here, not the destination. */
export const landmarkSources = (l: Landmark): readonly LandmarkSource[] => [
  ...sourceOf('Wikipedia', l.wiki),
  ...sourceOf('Wikidata', l.wd),
  ...sourceOf('OpenStreetMap', osmUrl(l.id)),
];
