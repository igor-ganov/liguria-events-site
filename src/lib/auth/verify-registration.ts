import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';

/** Verify a registration ceremony against the challenge we stored for it. */
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
