// Passkey credentials in D1. Every statement now lives in its own module — one
// query per file, with the pure row shaping (to-stored-credential.ts,
// parse-transports.ts, the base64url pair) split out and unit-tested. This file
// stays the import surface the API endpoints already use.
export type { CredentialRow, NewCredential, PasskeyInfo, StoredCredential } from './credential-types.ts';
export { addCredential } from './add-credential.ts';
export { bumpCounter } from './bump-counter.ts';
export { deleteCredential } from './delete-credential.ts';
export { getCredential } from './get-credential.ts';
export { listUserCredentials } from './list-user-credentials.ts';
export { listUserPasskeys } from './list-user-passkeys.ts';
