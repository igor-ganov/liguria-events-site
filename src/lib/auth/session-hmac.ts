// The signing primitive behind the stateless session cookie: HMAC-SHA256 over
// `subject.expiry`, base64url-encoded. Shared by the signer and the reader so
// both sides can never drift apart.
const encoder = new TextEncoder();

const importKey = (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);

const toB64Url = (bytes: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

/** base64url HMAC-SHA256 of `data` under `secret`. */
export const sessionHmac = async (secret: string, data: string): Promise<string> =>
  toB64Url(await crypto.subtle.sign('HMAC', await importKey(secret), encoder.encode(data)));
