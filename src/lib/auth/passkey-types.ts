/** A credential as the ceremony options refer to it (allow/exclude lists). */
export type CredRef = { id: string; transports: string[] };

/** Which authenticator the ceremony should steer to. */
export type Attachment = 'platform' | 'cross-platform';
