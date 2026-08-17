import { glyphFont } from './glyph-font.ts';
import type { StyleSpecification } from 'maplibre-gl';

/** Where the picker's tiles, glyphs and sprite live. */
export type PickerUrls = Readonly<{ pmtiles: string; base: string; origin: string }>;

// `Object(x)` boxes primitives and yields `{}` for the nullish values, so these
// reads and writes stay safe on arbitrary style JSON without a cast or a guard.
const isPoiLayer = (layer: unknown): boolean => Object(layer)['source-layer'] === 'poi';

// Collapse a label's font stack to ONE self-hosted face: a glyph folder holds a
// single face, so a comma-joined stack 404s and every label disappears.
const singleGlyphFont = (layer: unknown): void => {
  const layout: unknown = Object(layer)['layout'];
  const fonts: unknown = Object(layout)['text-font'];
  [layout]
    .filter(() => Array.isArray(fonts))
    .forEach((target) => {
      Object(target)['text-font'] = [glyphFont(String(Object(fonts)[0] ?? 'Noto Sans Regular'))];
    });
};

/**
 * The event form's own trimmed basemap style: one PMTiles source, the
 * self-hosted glyphs and sprite (maplibre-gl 5 requires an ABSOLUTE sprite
 * URL), and no basemap POI icons — the dropped pin IS the POI. Built on a clone
 * so the picker can never affect the live map's copy of the same style.
 */
export const pickerStyle = (base: StyleSpecification, urls: PickerUrls): StyleSpecification => {
  const style = structuredClone(base);
  const layers = style.layers.filter((layer) => isPoiLayer(layer) === false);
  layers.forEach(singleGlyphFont);
  return {
    ...style,
    sources: { openmaptiles: { type: 'vector', url: `pmtiles://${urls.pmtiles}` } },
    glyphs: `${urls.base}/font/{fontstack}/{range}.pbf`,
    sprite: `${urls.origin}${urls.base}/sprite/poi-color/sprite`,
    layers,
  };
};
