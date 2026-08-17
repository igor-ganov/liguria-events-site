import { isDefined } from '../../lib/is-defined.ts';
import { search } from '../../lib/search/index.ts';
import type { PreparedIndex } from '../../lib/search/index.ts';

// Far more than a day's feed shows; the cap only stops a pathological query.
const LIMIT = 500;

/** The ids a query matched, or nothing at all when there is no query yet —
 *  "no filter" and "no hits" must not read the same. */
export const feedHits = (
  index: PreparedIndex | undefined,
  query: string,
): ReadonlySet<string> | undefined =>
  [index]
    .filter(isDefined)
    .filter(() => query.trim() !== '')
    .map((prepared) => new Set(search(prepared, query.trim(), LIMIT).map((hit) => hit.doc.id)))[0];
