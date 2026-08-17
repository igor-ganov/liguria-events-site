import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import type { CredRef } from './passkey-types.ts';

/** Credential references in the descriptor shape the ceremony options take.
 *  The transports strings come back from the same library that consumes them. */
export const toDescriptors = (creds: CredRef[]) =>
  creds.map((c) => ({ id: c.id, transports: c.transports as AuthenticatorTransportFuture[] }));
