import { toB64Url } from './to-b64-url.ts';
import type { NewCredential } from './credential-types.ts';

const SQL = `INSERT INTO passkey_credentials
         (credential_id, user_id, public_key, sign_count, transports, device_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`;

/** Persist a credential produced by a registration ceremony. */
export const addCredential = async (db: D1Database, cred: NewCredential, nowIso: string): Promise<void> => {
  await db
    .prepare(SQL)
    .bind(
      cred.credentialId, cred.userId, toB64Url(cred.publicKey), cred.counter,
      JSON.stringify(cred.transports), cred.deviceName, nowIso,
    )
    .run();
};
