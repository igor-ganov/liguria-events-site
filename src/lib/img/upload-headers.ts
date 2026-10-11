import { isRewrittenUpload } from './is-rewritten-upload.ts';

/** The bit of an R2 object the response headers are built from. */
export type CacheableObject = Readonly<{
  writeHttpMetadata: (headers: Headers) => void;
  httpEtag: string;
}>;

const FOREVER = 'public, max-age=31536000, immutable';

const cachingOf = (key: string): string => [key].filter(isRewrittenUpload).map(() => 'no-cache')[0] ?? FOREVER;

/** Response headers for a stored upload: the object's own content metadata, its
 *  etag, and a year of immutable caching (the key contains a random id, so a
 *  replaced image is a new URL) — except for a report, which keeps its name. */
export const uploadHeaders = (object: CacheableObject, key = ''): Headers => {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', cachingOf(key));
  return headers;
};
