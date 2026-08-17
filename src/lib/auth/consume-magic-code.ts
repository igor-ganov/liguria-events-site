import { discardMagicCode } from './discard-magic-code.ts';
import { MAGIC } from './magic-config.ts';
import { registerMagicAttempt } from './register-magic-attempt.ts';
import type { CodeRecord } from './magic-record.ts';

const accept = async (kv: KVNamespace, email: string, rec: CodeRecord): Promise<string> => {
  await discardMagicCode(kv, email, rec);
  return email;
};

/** Exactly one of the two paths runs: the code matches and is burnt, or the
 *  attempt is counted. The comparison stays the strict one it always was. */
const match = async (kv: KVNamespace, email: string, code: string, rec: CodeRecord): Promise<string | null> => {
  const accepted = await Promise.all([rec].filter((r) => r.code === code).map((r) => accept(kv, email, r)));
  return accepted.at(0) ?? (await registerMagicAttempt(kv, email, rec));
};

/** Consume the code for an email; wrong codes are limited to MAX_ATTEMPTS. */
export const consumeMagicCode = async (
  kv: KVNamespace,
  email: string,
  code: string,
): Promise<string | null> => {
  const norm = email.trim().toLowerCase();
  const raw = await kv.get(`${MAGIC.codePrefix}${norm}`);
  // `Boolean(raw)` keeps the original `if (!raw) return null` verbatim.
  const records = [raw]
    .filter((value): value is string => Boolean(value))
    .map((value): CodeRecord => JSON.parse(value));
  const results = await Promise.all(records.map((rec) => match(kv, norm, code, rec)));
  return results.at(0) ?? null;
};
