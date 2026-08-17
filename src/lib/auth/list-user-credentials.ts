import { parseTransports } from './parse-transports.ts';

const SQL = 'SELECT credential_id, transports FROM passkey_credentials WHERE user_id = ?';

/** Every credential id a person has registered (for allow/exclude lists). */
export const listUserCredentials = async (
  db: D1Database,
  userId: string,
): Promise<{ id: string; transports: string[] }[]> => {
  const res = await db
    .prepare(SQL)
    .bind(userId)
    .all<{ credential_id: string; transports: string | null }>();
  return (res.results ?? []).map((row) => ({
    id: row.credential_id,
    transports: parseTransports(row.transports),
  }));
};
