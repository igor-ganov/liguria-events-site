const toB64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');

const fromB64Url = (value: string): Uint8Array => {
  const bin = atob(value.replaceAll('-', '+').replaceAll('_', '/'));
  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
};

export type StoredCredential = {
  credentialId: string;
  userId: string;
  publicKey: Uint8Array;
  counter: number;
  transports: string[];
};

export type NewCredential = {
  credentialId: string;
  userId: string;
  publicKey: Uint8Array;
  counter: number;
  transports: readonly string[];
  deviceName: string;
};

export const addCredential = async (db: D1Database, cred: NewCredential, nowIso: string): Promise<void> => {
  await db
    .prepare(
      `INSERT INTO passkey_credentials
         (credential_id, user_id, public_key, sign_count, transports, device_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      cred.credentialId, cred.userId, toB64Url(cred.publicKey), cred.counter,
      JSON.stringify(cred.transports), cred.deviceName, nowIso,
    )
    .run();
};

type Row = { credential_id: string; user_id: string; public_key: string; sign_count: number; transports: string | null };

const toStored = (r: Row): StoredCredential => ({
  credentialId: r.credential_id,
  userId: r.user_id,
  publicKey: fromB64Url(r.public_key),
  counter: r.sign_count,
  transports: (() => {
    try {
      const t = JSON.parse(r.transports ?? '[]') as unknown;
      return Array.isArray(t) ? t.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  })(),
});

export const getCredential = async (db: D1Database, credentialId: string): Promise<StoredCredential | null> => {
  const r = await db
    .prepare('SELECT credential_id, user_id, public_key, sign_count, transports FROM passkey_credentials WHERE credential_id = ?')
    .bind(credentialId)
    .first<Row>();
  return r ? toStored(r) : null;
};

export const listUserCredentials = async (
  db: D1Database,
  userId: string,
): Promise<{ id: string; transports: string[] }[]> => {
  const r = await db
    .prepare('SELECT credential_id, transports FROM passkey_credentials WHERE user_id = ?')
    .bind(userId)
    .all<{ credential_id: string; transports: string | null }>();
  return (r.results ?? []).map((row) => ({
    id: row.credential_id,
    transports: (() => {
      try {
        const t = JSON.parse(row.transports ?? '[]') as unknown;
        return Array.isArray(t) ? t.filter((x): x is string => typeof x === 'string') : [];
      } catch {
        return [];
      }
    })(),
  }));
};

export const bumpCounter = async (db: D1Database, credentialId: string, counter: number, nowIso: string): Promise<void> => {
  await db
    .prepare('UPDATE passkey_credentials SET sign_count = ?, last_used_at = ? WHERE credential_id = ?')
    .bind(counter, nowIso, credentialId)
    .run();
};

export type PasskeyInfo = { id: string; deviceName: string; createdAt: string; lastUsedAt: string | null };

export const listUserPasskeys = async (db: D1Database, userId: string): Promise<PasskeyInfo[]> => {
  const r = await db
    .prepare('SELECT credential_id, device_name, created_at, last_used_at FROM passkey_credentials WHERE user_id = ? ORDER BY created_at')
    .bind(userId)
    .all<{ credential_id: string; device_name: string | null; created_at: string; last_used_at: string | null }>();
  return (r.results ?? []).map((row) => ({
    id: row.credential_id,
    deviceName: row.device_name ?? 'Passkey',
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  }));
};

/** Delete a passkey, scoped to its owner (a user can't delete another's). */
export const deleteCredential = async (db: D1Database, userId: string, credentialId: string): Promise<void> => {
  await db
    .prepare('DELETE FROM passkey_credentials WHERE credential_id = ? AND user_id = ?')
    .bind(credentialId, userId)
    .run();
};
