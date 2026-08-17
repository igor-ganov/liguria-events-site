import { toStoredCredential } from './to-stored-credential.ts';
import type { CredentialRow, StoredCredential } from './credential-types.ts';

const SQL =
  'SELECT credential_id, user_id, public_key, sign_count, transports FROM passkey_credentials WHERE credential_id = ?';

/** Load one credential by its id; null when the id is unknown. */
export const getCredential = async (db: D1Database, credentialId: string): Promise<StoredCredential | null> => {
  const row = await db.prepare(SQL).bind(credentialId).first<CredentialRow>();
  // 0-or-1 row: `Boolean(row)` keeps the original truthiness test verbatim.
  return [row].filter((r): r is CredentialRow => Boolean(r)).map(toStoredCredential).at(0) ?? null;
};
