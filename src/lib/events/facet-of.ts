import { FACETS } from './city-facets.ts';
import type { Facet } from './city-facets.ts';

/**
 * The facet a path segment names, if it names one.
 *
 * A facet always wins over a venue of the same slug: there is no venue called
 * "today", and the closed set makes the precedence decidable without a lookup.
 */
export const facetOf = (slug: string): Facet | undefined =>
  FACETS.find((facet) => facet.slug === slug);
