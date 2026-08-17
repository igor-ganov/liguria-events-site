/** Base64url-encode raw bytes (the storage form of a credential public key). */
export const toB64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
