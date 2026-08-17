/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */

/** A character range in {@link Snippet.text} that matched the query. */
export interface Mark {
  readonly start: number;
  readonly end: number;
}

/**
 * A quote from the document, and where inside it the query landed. Ranges, not
 * HTML — the renderer escapes `text` and wraps `marks` itself.
 */
export interface Snippet {
  readonly text: string;
  readonly marks: readonly Mark[];
}
