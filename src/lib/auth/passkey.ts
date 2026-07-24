import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import type { StoredCredential } from './credentials.ts';

const RP_NAME = 'Dove Go';

type CredRef = { id: string; transports: string[] };
const toDescriptors = (creds: CredRef[]) =>
  creds.map((c) => ({ id: c.id, transports: c.transports as AuthenticatorTransportFuture[] }));

type Attachment = 'platform' | 'cross-platform';

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
    // `residentKey: required` makes every passkey discoverable, so sign-in can
    // offer it without the user typing an email (conditional UI). When the
    // caller names an attachment we steer the ceremony — first-time setup asks
    // for `platform` so it lands on Windows Hello / Touch ID, not a phone.
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
      ...(attachment ? { authenticatorAttachment: attachment } : {}),
    },
  });

export const verifyRegistration = (
  response: RegistrationResponseJSON,
  expectedChallenge: string,
  rpID: string,
  origin: string,
) =>
  verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });

export const authenticationOptions = (rpID: string, allow: CredRef[]) =>
  generateAuthenticationOptions({ rpID, allowCredentials: toDescriptors(allow), userVerification: 'preferred' });

export const verifyAuthentication = (
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  rpID: string,
  origin: string,
  credential: StoredCredential,
) =>
  verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.credentialId,
      publicKey: new Uint8Array(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports as AuthenticatorTransportFuture[],
    },
    requireUserVerification: false,
  });
