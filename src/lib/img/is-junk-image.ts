// Some Wikidata P18 / Wikipedia pageimage values are not a photo of the place
// but an infobox DECORATION scraped by mistake: a pushpin location map, a
// topographic/relief map, a flag, or a coat of arms. These must never be shown
// as a landmark/place photo (the "Castello Spinola → Italy_North_location_map"
// bug). Matched on the file name so it works on a full Special:FilePath URL or a
// bare name. Patterns are the real offenders seen in the shards; kept tight to
// avoid rejecting genuine photos (e.g. "Mont_Blanc…" ≠ "blank").
// Letter-boundaries (not \b): in these file names tokens are joined by _ - ( ),
// all of which \b treats as word chars, so "Bandiera_(senza_stemma)" would slip
// through \bstemma\b. (?<![a-z]) / (?![a-z]) treat every non-letter as an edge.
const JUNK =
  /(?<![a-z])(?:location[ _-]?map|locator|relief[ _]?location|topographic[ _]?map|blank|flag[ _]of|bandiera|coat[ _]of[ _]arms|stemma)(?![a-z])/i;

const fileNameOf = (url: string): string =>
  decodeURIComponent((url.split('/').pop() ?? '').split('?')[0] ?? '');

/** A missing or empty URL is not junk — it is simply no image. */
export const isJunkImage = (url: string | undefined): boolean =>
  [url ?? '']
    .filter((raw) => raw !== '')
    .map(fileNameOf)
    .some((file) => JUNK.test(file));
