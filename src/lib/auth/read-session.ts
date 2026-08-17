import { equalConstantTime } from './equal-constant-time.ts';
import { isDefined } from '../is-defined.ts';
import { sessionHmac } from './session-hmac.ts';

type TokenParts = Readonly<{ subject: string; expiry: string; sig: string }>;

// Every field is `string | undefined` rather than optional: a three-way split of
// a short token leaves the missing slots absent, and this project's TS runs with
// exactOptionalPropertyTypes.
type SplitToken = Readonly<{ subject: string | undefined; expiry: string | undefined; sig: string | undefined }>;

const isComplete = (p: SplitToken): p is TokenParts =>
  p.subject !== undefined && p.expiry !== undefined && p.sig !== undefined;

// A 0-or-1 array: a malformed token yields nothing, so nothing downstream —
// the HMAC included — is ever computed for it.
const partsOf = (token: string): TokenParts | undefined => {
  const [subject, expiry, sig] = token.split('.');
  return [{ subject, expiry, sig }].filter(isComplete).at(0);
};

const verified = async (parts: TokenParts, secret: string, nowMs: number): Promise<string | undefined> => {
  const expected = await sessionHmac(secret, `${parts.subject}.${parts.expiry}`);
  return [parts]
    .filter(() => parts.sig.length === expected.length)
    .filter(() => equalConstantTime(parts.sig, expected))
    // Negated on purpose: a non-numeric expiry compares NaN, which is neither
    // past nor future — the original guard let it through and so does this one.
    .filter(() => !(Number(parts.expiry) < nowMs))
    .map((p) => p.subject)
    .at(0);
};

/** Return the subject (user id) if the token is well-formed, unexpired and
 *  authentic. The empty result keeps the pre-existing rejection value that the
 *  middleware compares against — the security rule for src/lib/auth forbids
 *  changing a rejection value during a refactor, so it is deliberately not
 *  migrated to the project's usual absent-value convention. */
export const readSession = async (token: string, secret: string, nowMs: number): Promise<string | null> => {
  const subjects = await Promise.all(
    [partsOf(token)].filter(isDefined).map((parts) => verified(parts, secret, nowMs)),
  );
  return subjects.at(0) ?? null;
};
