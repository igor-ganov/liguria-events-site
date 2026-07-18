/*
 * Vendored from @prometheus/search-core (communist-prometheus/public-website,
 * MIT) — a dependency-free, typo-tolerant, Cyrillic-aware fuzzy scorer. Kept as
 * a copy so this site's build stays self-contained; improvements worth sharing
 * go back upstream, not the other way around. See src/lib/search/README.md.
 */

/** What a hit is labelled as; `event` is this site's addition. */
export type SearchSection = 'event' | 'page';

/** One indexed document. */
export interface SearchDoc {
  /** Stable id — for events, the event id. */
  readonly id: string;
  readonly lang: string;
  readonly section: SearchSection;
  /** Where a result row points. */
  readonly url: string;
  readonly title: string;
  readonly description: string;
  /** Plain text the body search runs over. */
  readonly body: string;
}

/** A whole language's index, as prepared for the browser. */
export interface SearchIndex {
  readonly lang: string;
  readonly docs: readonly SearchDoc[];
}
