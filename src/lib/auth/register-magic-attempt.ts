import { branch } from '../branch.ts';
import { discardMagicCode } from './discard-magic-code.ts';
import { MAGIC } from './magic-config.ts';
import { magicAttemptsExhausted } from './magic-attempts-exhausted.ts';
import type { CodeRecord } from './magic-record.ts';

const remember = async (kv: KVNamespace, email: string, rec: CodeRecord, attempts: number): Promise<void> => {
  await kv.put(`${MAGIC.codePrefix}${email}`, JSON.stringify({ ...rec, attempts }), {
    expirationTtl: MAGIC.ttlS,
  });
};

/** A wrong code: count the attempt, and burn the record once the ceiling is
 *  reached so the code cannot be brute-forced. Always resolves null. */
export const registerMagicAttempt = async (
  kv: KVNamespace,
  email: string,
  rec: CodeRecord,
): Promise<null> => {
  const attempts = rec.attempts + 1;
  await branch(magicAttemptsExhausted(attempts))<Promise<void>>(
    () => discardMagicCode(kv, email, rec),
    () => remember(kv, email, rec, attempts),
  );
  return null;
};
