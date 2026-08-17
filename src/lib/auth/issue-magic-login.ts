import { MAGIC } from './magic-config.ts';
import { randomCode } from './random-code.ts';
import { randomToken } from './random-token.ts';

/** Write the rate marker, then the token and the code — same order as before. */
const issue = async (kv: KVNamespace, email: string): Promise<{ token: string; code: string }> => {
  await kv.put(`${MAGIC.ratePrefix}${email}`, '1', { expirationTtl: MAGIC.rateTtlS });
  const token = randomToken();
  const code = randomCode();
  await kv.put(`${MAGIC.tokenPrefix}${token}`, email, { expirationTtl: MAGIC.ttlS });
  await kv.put(`${MAGIC.codePrefix}${email}`, JSON.stringify({ code, token, attempts: 0 }), {
    expirationTtl: MAGIC.ttlS,
  });
  return { token, code };
};

/** Issue a link token + a 6-digit code for an email; null if rate-limited (60s). */
export const issueMagicLogin = async (
  kv: KVNamespace,
  email: string,
): Promise<{ token: string; code: string } | null> => {
  const norm = email.trim().toLowerCase();
  const marker = await kv.get(`${MAGIC.ratePrefix}${norm}`);
  // A truthy marker means "issued within 60s" — `!marker` is the original test.
  const issued = await Promise.all([marker].filter((value) => !value).map(() => issue(kv, norm)));
  return issued.at(0) ?? null;
};
