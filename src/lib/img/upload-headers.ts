/** The bit of an R2 object the response headers are built from. */
export type CacheableObject = Readonly<{
  writeHttpMetadata: (headers: Headers) => void;
  httpEtag: string;
}>;

/** Response headers for a stored upload: the object's own content metadata, its
 *  etag, and a year of immutable caching (the key contains a random id, so a
 *  replaced image is a new URL). */
export const uploadHeaders = (object: CacheableObject): Headers => {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return headers;
};
