// Wikimedia image URLs come to us in two broken-on-the-client forms:
//   • Wikidata P18 (SPARQL) returns `http://…/Special:FilePath/File.jpg` — http,
//     so an https page blocks it as mixed content.
//   • Wikipedia pageimages returns `https://upload.wikimedia.org/wikipedia/
//     <project>/…/thumb/…/960px-File.jpg` — and Wikimedia now 400s any width
//     that isn't a blessed bucket, so rewriting `/960px-` to `/96px-` fails.
// Both are fixed by routing through Special:FilePath, which renders ANY width on
// demand over https. The file may live on Commons OR a language wiki (e.g.
// `/wikipedia/it/…`), and Special:FilePath must target the matching host.
type Ref = Readonly<{ host: string; name: string }>;
const projectHost = (project: string): string =>
  project === 'commons' ? 'commons.wikimedia.org' : `${project}.wikipedia.org`;

const parse = (u: string): Ref | undefined => {
  const fp = u.match(/\/\/([a-z0-9.-]+)\/wiki\/Special:FilePath\/(.+)$/);
  if (fp?.[1] && fp[2]) return { host: fp[1], name: fp[2] };
  const up = u.match(/\/wikipedia\/([a-z0-9-]+)\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+?)(?:\/\d+px-[^/]+)?$/);
  return up?.[1] && up[2] ? { host: projectHost(up[1]), name: up[2] } : undefined;
};

/** A width-N, https, on-demand thumbnail for a Commons/Wikipedia image URL.
 *  Non-Wikimedia URLs (e.g. event covers) pass through, only http→https. */
export const commonsImg = (url: string, width: number): string => {
  const ref = parse((url.split('?')[0] ?? url));
  return ref
    ? `https://${ref.host}/wiki/Special:FilePath/${ref.name}?width=${width}`
    : url.replace(/^http:\/\//, 'https://');
};
