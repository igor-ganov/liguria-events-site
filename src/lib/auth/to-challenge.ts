import type { Challenge, ChallengeRow } from './challenge-types.ts';

// Anything that is not the literal 'register' is an authentication challenge —
// the same collapse the stored string used to get from a ternary.
const PURPOSES = new Map<string, Challenge['purpose']>([['register', 'register']]);

// A 0-or-1 array: an absent or empty user id contributes no key at all, so the
// optional property stays absent rather than becoming an empty string.
const userIdOf = (raw: ChallengeRow['user_id']): Readonly<{ userId?: string }> =>
  [raw ?? '']
    .filter((value) => value !== '')
    .map((userId) => ({ userId }))
    .at(0) ?? {};

/** Shape a stored row into the challenge the WebAuthn endpoints consume. */
export const toChallenge = (row: ChallengeRow): Challenge => ({
  purpose: PURPOSES.get(row.purpose) ?? 'auth',
  challenge: row.challenge,
  ...userIdOf(row.user_id),
});
