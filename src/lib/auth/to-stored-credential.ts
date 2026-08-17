import { fromB64Url } from './from-b64-url.ts';
import { parseTransports } from './parse-transports.ts';
import type { CredentialRow, StoredCredential } from './credential-types.ts';

/** Map a credential row to the shape the WebAuthn verifier expects. */
export const toStoredCredential = (row: CredentialRow): StoredCredential => ({
  credentialId: row.credential_id,
  userId: row.user_id,
  publicKey: fromB64Url(row.public_key),
  counter: row.sign_count,
  transports: parseTransports(row.transports),
});
