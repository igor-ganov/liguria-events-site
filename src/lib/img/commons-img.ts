import { isDefined } from '../is-defined.ts';

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

// Commons is the shared repository; every other project code is a language wiki.
const HOSTS = new Map([['commons', 'commons.wikimedia.org']]);
const projectHost = (project: string): string => HOSTS.get(project) ?? `${project}.wikipedia.org`;

const FILE_PATH = /\/\/([a-z0-9.-]+)\/wiki\/Special:FilePath\/(.+)$/;
const UPLOAD = /\/wikipedia\/([a-z0-9-]+)\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+?)(?:\/\d+px-[^/]+)?$/;

// Both fields are `string | undefined` rather than optional: a non-match leaves
// the capture groups absent, and this project's TS runs with
// exactOptionalPropertyTypes.
type MaybeRef = Readonly<{ host: string | undefined; name: string | undefined }>;

const complete = (ref: MaybeRef): ref is Ref => Boolean(ref.host) && Boolean(ref.name);

const filePathRef = (u: string): Ref | undefined => {
  const [, host, name] = u.match(FILE_PATH) ?? [];
  return [{ host, name }].filter(complete).at(0);
};

const uploadRef = (u: string): Ref | undefined => {
  const [, project, name] = u.match(UPLOAD) ?? [];
  return [{ host: project, name }]
    .filter(complete)
    .map((ref) => ({ host: projectHost(ref.host), name: ref.name }))
    .at(0);
};

/** A width-N, https, on-demand thumbnail for a Commons/Wikipedia image URL.
 *  Non-Wikimedia URLs (e.g. event covers) pass through, only http→https. */
export const commonsImg = (url: string, width: number): string => {
  const bare = url.split('?')[0] ?? url;
  return (
    [filePathRef(bare) ?? uploadRef(bare)]
      .filter(isDefined)
      .map((ref) => `https://${ref.host}/wiki/Special:FilePath/${ref.name}?width=${width}`)
      .at(0) ?? url.replace(/^http:\/\//, 'https://')
  );
};
