// WebAuthn challenges in D1 (strongly consistent, unlike KV): written then read
// across requests within seconds, and consumed atomically (single-use).
const TTL_MS = 60_000;

export type Challenge = { purpose: 'register' | 'auth'; challenge: string; userId?: string };

export const putChallenge = async (db: D1Database, id: string, data: Challenge): Promise<void> => {
  await db
    .prepare('INSERT INTO webauthn_challenges (id, purpose, user_id, challenge, expires_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, data.purpose, data.userId ?? null, data.challenge, Date.now() + TTL_MS)
    .run();
};

type Row = { purpose: string; user_id: string | null; challenge: string; expires_at: number };

/** Atomically read + delete a challenge (single-use); null if missing/expired. */
export const takeChallenge = async (db: D1Database, id: string): Promise<Challenge | null> => {
  const row = await db
    .prepare('DELETE FROM webauthn_challenges WHERE id = ? RETURNING purpose, user_id, challenge, expires_at')
    .bind(id)
    .first<Row>();
  if (!row || row.expires_at < Date.now()) return null;
  const purpose = row.purpose === 'register' ? 'register' : 'auth';
  return { purpose, challenge: row.challenge, ...(row.user_id ? { userId: row.user_id } : {}) };
};
