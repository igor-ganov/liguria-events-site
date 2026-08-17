import { branch } from '../branch.ts';

// User-uploaded event images live under /uploads/ on the dovego.it zone, where
// Cloudflare Transformations can resize + reformat them on the fly. Wrap such a
// URL for the requested width; any other URL (crawler / Wikimedia) passes
// through untouched (those are already sized by commonsImg / the source).
export const resized = (url: string, width: number): string =>
  branch(url.startsWith('/uploads/'))<string>(
    () => `/cdn-cgi/image/width=${width},format=auto,quality=82${url}`,
    () => url,
  );
