/** base64url of a source image URL, so it can ride in a path segment without
 *  the router or an intermediary rewriting its slashes and percent escapes. */
export const encodeImageSource = (src: string): string =>
  btoa(Array.from(new TextEncoder().encode(src), (byte) => String.fromCharCode(byte)).join(''))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
