import type { Challenge } from './challenge-types.ts';

// WebAuthn challenges live in D1 (strongly consistent, unlike KV): written then
// read across requests within seconds, and consumed atomically (single-use).
const TTL_MS = 60_000;

export const putChallenge = async (db: D1Database, id: string, data: Challenge): Promise<void> => {
  await db
    .prepare('INSERT INTO webauthn_challenges (id, purpose, user_id, challenge, expires_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, data.purpose, data.userId ?? null, data.challenge, Date.now() + TTL_MS)
    .run();
};
