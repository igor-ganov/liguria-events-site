/**
 * The region the site was founded in.
 *
 * Two jobs, both of them about the past rather than about a default: an event
 * crawled before the corpus carried a region is a Liguria event, and a reader
 * whose own region is unknown AND whose corpus failed to load has to land
 * somewhere. Everything else — the front door, the bare /calendar and /map —
 * chooses a region from the reader and the data; see entryRegion.
 */
export const LEGACY_REGION = 'liguria';
