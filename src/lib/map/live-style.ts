import { branch } from '../branch.ts';
import { withDetailSource } from './with-detail-source.ts';
import { withRoadHighlight } from './with-road-highlight.ts';
import { withSingleGlyphFont } from './with-single-glyph-font.ts';
import { withoutPoiLayers } from './without-poi-layers.ts';
import type { StyleSpecification } from 'maplibre-gl';

/** Where the live map's tiles, glyphs and sprite live. The basemap can't be a
 *  Worker asset (25 MiB cap), so its host is configurable. */
export type LiveUrls = Readonly<{
  pmtiles: string;
  detail: string;
  base: string;
  origin: string;
  attribution: string;
}>;

/**
 * The style the live map runs on, built from a theme's base style. Two vector
 * sources: the country-wide extract (panning past Liguria used to leave the
 * canvas blank) and a second z14 extract of Liguria the building layer reads
 * from, since the country-wide one tops out at z12 where OpenMapTiles carries
 * no footprints. Then the four layer rewrites — drop the basemap POIs (our
 * curated markers ARE the POI layer), repoint the high-zoom layers at the
 * detail source, collapse label font stacks to one self-hosted face, and, on
 * dark only, brighten the major roads Dark Matter leaves too subtle to read.
 * maplibre-gl 5 requires an ABSOLUTE sprite URL; a root-relative one fails.
 */
export const liveStyle =
  (urls: LiveUrls) =>
  (base: StyleSpecification, dark: boolean): StyleSpecification => {
    const style = structuredClone(base);
    const rewritten = withSingleGlyphFont(withDetailSource('detail')(withoutPoiLayers(style.layers)));
    const layers = branch(dark)(
      () => withRoadHighlight(rewritten),
      () => rewritten,
    );
    // Object.assign rather than four assignments: the rewritten layers are the
    // app's structural StyleLayer view of the style JSON, and merging them in
    // keeps the whole build cast-free while still mutating the clone in place.
    return Object.assign(style, {
      sources: {
        openmaptiles: { type: 'vector', url: `pmtiles://${urls.pmtiles}`, attribution: urls.attribution },
        detail: { type: 'vector', url: `pmtiles://${urls.detail}` },
      },
      glyphs: `${urls.base}/font/{fontstack}/{range}.pbf`,
      sprite: `${urls.origin}${urls.base}/sprite/poi-color/sprite`,
      layers,
    });
  };
