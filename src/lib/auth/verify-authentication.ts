import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON, AuthenticatorTransportFuture } from '@simplewebauthn/server';
import type { StoredCredential } from './credential-types.ts';

/** Verify a sign-in assertion against the stored credential and challenge. */
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
