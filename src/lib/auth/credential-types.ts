// Shapes shared by the passkey-credential queries. Type-only module: the D1 row
// shapes stay next to the domain types they are mapped into.

/** A stored credential as the WebAuthn verifier needs it. */
export type StoredCredential = {
  credentialId: string;
  userId: string;
  publicKey: Uint8Array;
  counter: number;
  transports: string[];
};

/** A credential fresh out of a registration ceremony, ready to persist. */
export type NewCredential = {
  credentialId: string;
  userId: string;
  publicKey: Uint8Array;
  counter: number;
  transports: readonly string[];
  deviceName: string;
};

/** The columns every credential read selects. */
export type CredentialRow = {
  credential_id: string;
  user_id: string;
  public_key: string;
  sign_count: number;
  transports: string | null;
};

/** What the settings page shows about a registered passkey. */
export type PasskeyInfo = { id: string; deviceName: string; createdAt: string; lastUsedAt: string | null };
