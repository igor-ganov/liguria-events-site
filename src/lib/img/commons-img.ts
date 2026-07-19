// Wikimedia image URLs come to us in two broken-on-the-client forms:
//   • Wikidata P18 (SPARQL) returns `http://…/Special:FilePath/File.jpg` — http,
//     so an https page blocks it as mixed content.
//   • Wikipedia pageimages returns `https://upload.wikimedia.org/…/thumb/…/960px-
//     File.jpg` — and Wikimedia now 400s any width that isn't a blessed bucket,
//     so rewriting `/960px-` to `/96px-` (or /240px-) fails.
// Both are fixed by routing through Special:FilePath, which renders ANY width on
// demand over https. Extract the file name from either form and rebuild it.
const fileName = (u: string): string | undefined => {
  const fp = u.match(/Special:FilePath\/(.+)$/);
  if (fp) return fp[1];
  const thumb = u.match(/\/commons\/thumb\/[0-9a-f]\/[0-9a-f]{2}\/([^/]+)\/\d+px-/);
  if (thumb) return thumb[1];
  const full = u.match(/\/commons\/[0-9a-f]\/[0-9a-f]{2}\/([^/]+)$/);
  return full?.[1];
};

/** A width-N, https, on-demand thumbnail for a Commons/Wikipedia image URL.
 *  Non-Wikimedia URLs (e.g. event covers) pass through, only http→https. */
export const commonsImg = (url: string, width: number): string => {
  const name = fileName((url.split('?')[0] ?? url));
  return name
    ? `https://commons.wikimedia.org/wiki/Special:FilePath/${name}?width=${width}`
    : url.replace(/^http:\/\//, 'https://');
};
