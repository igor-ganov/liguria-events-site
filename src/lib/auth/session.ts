// Stateless signed-cookie sessions: `subject.expiry.hmac` (HMAC-SHA256).
// The subject is the user id; no server-side session store needed.
const encoder = new TextEncoder();
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

const hmac = async (secret: string, data: string): Promise<string> =>
  toB64Url(await crypto.subtle.sign('HMAC', await importKey(secret), encoder.encode(data)));

/** Cookie name for the session token. */
export const SESSION_COOKIE = 'dg_session';

/** Mint a signed session token for a user id, valid 7 days. */
export const signSession = async (secret: string, subject: string, nowMs: number): Promise<string> => {
  const payload = `${subject}.${nowMs + TTL_MS}`;
  return `${payload}.${await hmac(secret, payload)}`;
};

/** Return the subject (user id) if the token is well-formed, unexpired and authentic. */
export const readSession = async (token: string, secret: string, nowMs: number): Promise<string | null> => {
  const parts = token.split('.');
  const [subject, expiry, sig] = parts;
  if (subject === undefined || expiry === undefined || sig === undefined) return null;
  const expected = await hmac(secret, `${subject}.${expiry}`);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i += 1) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;
  if (Number(expiry) < nowMs) return null;
  return subject;
};
