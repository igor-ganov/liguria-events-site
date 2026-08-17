import { generateRegistrationOptions } from '@simplewebauthn/server';
import { authenticatorSelection } from './authenticator-selection.ts';
import { toDescriptors } from './to-descriptors.ts';
import type { Attachment, CredRef } from './passkey-types.ts';

const RP_NAME = 'Dove Go';

/** Options for a registration ceremony (first passkey or an extra device). */
export const registrationOptions = (
  rpID: string,
  userId: string,
  userName: string,
  exclude: CredRef[],
  attachment?: Attachment,
) =>
  generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userName,
    userID: new TextEncoder().encode(userId),
    attestationType: 'none',
    excludeCredentials: toDescriptors(exclude),
    authenticatorSelection: authenticatorSelection(attachment),
  });
