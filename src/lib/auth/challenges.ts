import type { KVNamespace } from '@cloudflare/workers-types';

// Short-lived, single-use WebAuthn challenges in KV.
const PREFIX = 'chal:';
const TTL_S = 300;

export type Challenge = { challenge: string; purpose: 'register' | 'auth'; userId?: string };

export const putChallenge = async (
  kv: KVNamespace,
  key: string,
  data: Challenge,
): Promise<void> => {
  await kv.put(`${PREFIX}${key}`, JSON.stringify(data), { expirationTtl: TTL_S });
};

/** Read and immediately delete a challenge (single-use). */
export const takeChallenge = async (kv: KVNamespace, key: string): Promise<Challenge | null> => {
  const raw = await kv.get(`${PREFIX}${key}`);
  if (!raw) return null;
  await kv.delete(`${PREFIX}${key}`);
  try {
    return JSON.parse(raw) as Challenge;
  } catch {
    return null;
  }
};
