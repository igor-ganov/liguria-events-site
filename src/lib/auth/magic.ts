// Passwordless login: a magic-link token AND a short numeric code, both bound
// to the email, single-use, 5-minute TTL, one issue per email per 60s. KV is
// fine here (minutes-long, not the seconds-tight passkey path).
const TOKEN_PREFIX = 'magic:';
const CODE_PREFIX = 'code:';
const RATE_PREFIX = 'magic-rate:';
const TTL_S = 300;
const MAX_ATTEMPTS = 5;

const randomToken = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const randomCode = (): string => {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return ((n[0] ?? 0) % 1_000_000).toString().padStart(6, '0');
};

type CodeRecord = { code: string; token: string; attempts: number };

/** Issue a link token + a 6-digit code for an email; null if rate-limited (60s). */
export const issueMagicLogin = async (
  kv: KVNamespace,
  email: string,
): Promise<{ token: string; code: string } | null> => {
  const norm = email.trim().toLowerCase();
  const rateKey = `${RATE_PREFIX}${norm}`;
  if (await kv.get(rateKey)) return null;
  await kv.put(rateKey, '1', { expirationTtl: 60 });
  const token = randomToken();
  const code = randomCode();
  await kv.put(`${TOKEN_PREFIX}${token}`, norm, { expirationTtl: TTL_S });
  await kv.put(`${CODE_PREFIX}${norm}`, JSON.stringify({ code, token, attempts: 0 }), {
    expirationTtl: TTL_S,
  });
  return { token, code };
};

/** Consume the link token (single-use); also invalidates the paired code. */
export const consumeMagicToken = async (kv: KVNamespace, token: string): Promise<string | null> => {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  const email = await kv.get(`${TOKEN_PREFIX}${token}`);
  if (!email) return null;
  await kv.delete(`${TOKEN_PREFIX}${token}`);
  await kv.delete(`${CODE_PREFIX}${email}`);
  return email;
};

/** Consume the code for an email; wrong codes are limited to MAX_ATTEMPTS. */
export const consumeMagicCode = async (
  kv: KVNamespace,
  email: string,
  code: string,
): Promise<string | null> => {
  const norm = email.trim().toLowerCase();
  const raw = await kv.get(`${CODE_PREFIX}${norm}`);
  if (!raw) return null;
  const rec = JSON.parse(raw) as CodeRecord;
  if (rec.code === code) {
    await kv.delete(`${CODE_PREFIX}${norm}`);
    await kv.delete(`${TOKEN_PREFIX}${rec.token}`);
    return norm;
  }
  const attempts = rec.attempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    await kv.delete(`${CODE_PREFIX}${norm}`);
    await kv.delete(`${TOKEN_PREFIX}${rec.token}`);
  } else {
    await kv.put(`${CODE_PREFIX}${norm}`, JSON.stringify({ ...rec, attempts }), {
      expirationTtl: TTL_S,
    });
  }
  return null;
};
