/** Inverse of `encodeImageSource`. Anything that is not one of our tokens
 *  comes back undefined — the caller answers 400 rather than fetching it. */
export const decodeImageSource = (token: string): string | undefined => {
  try {
    const base64 = token.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return new TextDecoder('utf-8', { fatal: true }).decode(
      Uint8Array.from(atob(padded), (char) => char.charCodeAt(0)),
    );
  } catch {
    return undefined;
  }
};
