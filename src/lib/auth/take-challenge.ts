import type { Challenge, ChallengeRow } from './challenge-types.ts';
import { isDefined } from '../is-defined.ts';
import { toChallenge } from './to-challenge.ts';

/** Atomically read + delete a challenge (single-use); empty if missing/expired. */
export const takeChallenge = async (db: D1Database, id: string): Promise<Challenge | null> => {
  const row = await db
    .prepare('DELETE FROM webauthn_challenges WHERE id = ? RETURNING purpose, user_id, challenge, expires_at')
    .bind(id)
    .first<ChallengeRow>();
  return (
    [row ?? undefined]
      .filter(isDefined)
      .filter((r) => !(r.expires_at < Date.now()))
      .map(toChallenge)
      .at(0) ?? null
  );
};
