/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */

/**
 * What a hit is worth per field. A title match means the document is ABOUT the
 * term; a body match means it merely says the word. The gap has to be wide
 * enough that no repetition in a body outranks a title.
 */
export const FIELD_WEIGHTS: Readonly<{ title: number; description: number; body: number }> = {
  title: 10,
  description: 4,
  body: 2,
};
