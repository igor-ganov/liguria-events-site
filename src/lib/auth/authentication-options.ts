import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { toDescriptors } from './to-descriptors.ts';
import type { CredRef } from './passkey-types.ts';

/** Options for a sign-in ceremony. */
export const authenticationOptions = (rpID: string, allow: CredRef[]) =>
  generateAuthenticationOptions({
    rpID,
    allowCredentials: toDescriptors(allow),
    userVerification: 'preferred',
  });
