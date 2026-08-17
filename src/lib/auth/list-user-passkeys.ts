import type { PasskeyInfo } from './credential-types.ts';

const SQL =
  'SELECT credential_id, device_name, created_at, last_used_at FROM passkey_credentials WHERE user_id = ? ORDER BY created_at';

type Row = { credential_id: string; device_name: string | null; created_at: string; last_used_at: string | null };

/** A person's passkeys as the settings page lists them. */
export const listUserPasskeys = async (db: D1Database, userId: string): Promise<PasskeyInfo[]> => {
  const res = await db.prepare(SQL).bind(userId).all<Row>();
  return (res.results ?? []).map((row) => ({
    id: row.credential_id,
    deviceName: row.device_name ?? 'Passkey',
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  }));
};
