// A Map, not an object literal: the key is the MIME type a browser put in the
// multipart body, so a plain object would answer for 'constructor' too.
const EXT = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
  ['image/gif', 'gif'],
]);

/** The stored file extension for an upload's MIME type, or nothing at all when
 *  the type is not one we accept. */
export const uploadExt = (mime: string): string | undefined => EXT.get(mime);
