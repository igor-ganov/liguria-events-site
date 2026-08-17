/**
 * Structural shapes for the parts of a MapLibre style this app rewrites before
 * handing it to the map. Deliberately minimal and index-signature based: the
 * style JSON is data, and describing only what we touch keeps the transforms
 * cast-free (no `as` into maplibre's full StyleSpecification).
 */

/** One style layer, as it appears in the style JSON. */
export type StyleLayer = Readonly<Record<string, unknown>>;

/** The label font stack of a symbol layer, when it has one. */
export type LayerLayout = Readonly<{ 'text-font'?: readonly string[] }>;
