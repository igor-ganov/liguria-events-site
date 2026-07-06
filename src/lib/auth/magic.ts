// Single-use, 5-minute magic-link tokens in KV, one issue per email per 60s.
const PREFIX = 'magic:';
const RATE_PREFIX = 'magic-rate:';
const TTL_S = 300;

const randomToken = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

/** Issue a token bound to an email; null if the email was asked again within 60s. */
export const issueMagicToken = async (kv: KVNamespace, email: string): Promise<string | null> => {
  const norm = email.trim().toLowerCase();
  const rateKey = `${RATE_PREFIX}${norm}`;
  if (await kv.get(rateKey)) return null;
  await kv.put(rateKey, '1', { expirationTtl: 60 });
  const token = randomToken();
  await kv.put(`${PREFIX}${token}`, norm, { expirationTtl: TTL_S });
  return token;
};

/** Consume a token (single-use); returns the bound email or null. */
export const consumeMagicToken = async (kv: KVNamespace, token: string): Promise<string | null> => {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  const key = `${PREFIX}${token}`;
  const email = await kv.get(key);
  if (!email) return null;
  await kv.delete(key);
  return email;
};
