import { isMagicToken } from './is-magic-token.ts';
import { MAGIC } from './magic-config.ts';

/** Single use: the token and the code issued with it both die here. */
const take = async (kv: KVNamespace, token: string, email: string): Promise<string> => {
  await kv.delete(`${MAGIC.tokenPrefix}${token}`);
  await kv.delete(`${MAGIC.codePrefix}${email}`);
  return email;
};

/** Consume the link token (single-use); also invalidates the paired code.
 *  Null for a malformed token, an unknown token and an expired one alike. */
export const consumeMagicToken = async (kv: KVNamespace, token: string): Promise<string | null> => {
  const stored = await Promise.all(
    [token].filter(isMagicToken).map((value) => kv.get(`${MAGIC.tokenPrefix}${value}`)),
  );
  // `Boolean(email)` keeps the original `if (!email) return null` verbatim.
  const consumed = await Promise.all(
    stored.filter((email): email is string => Boolean(email)).map((email) => take(kv, token, email)),
  );
  return consumed.at(0) ?? null;
};
