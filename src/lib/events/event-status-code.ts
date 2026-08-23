import { branch } from '../branch.ts';

// Every id this site mints is the first 12 characters of a SHA-256 digest —
// see eventIdOf in the collector.
const MINTED_ID = /^[0-9a-f]{12}$/;

/**
 * What to answer for an event page.
 *
 * Three situations, three codes. An event we can still resolve is `200`. An
 * event whose id is one of ours but which no longer resolves anywhere — not the
 * corpus, not the database, not the archive — is **`410 Gone`**: it existed and
 * is permanently over, which is a different statement from "no such page", and
 * the one search engines act on. Search Console is holding 15 806 URLs excluded
 * as 404s; 410 is how they get released.
 *
 * Anything else never named an event here, and keeps its `404`.
 *
 * The trade-off: an id that is well-formed but never existed answers 410 too.
 * Guessing twelve hex characters is not a thing that happens, and the cost of
 * being wrong is a crawler dropping a URL that was never there.
 */
export const eventStatusCode = (id: string, resolved: boolean): number =>
  branch(resolved)(
    () => 200,
    () => branch(MINTED_ID.test(id))(() => 410, () => 404),
  );
