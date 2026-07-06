import type { APIRoute } from 'astro';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { verifyRegistration } from '../../../lib/auth/passkey.ts';
import { addCredential } from '../../../lib/auth/credentials.ts';
import { takeChallenge } from '../../../lib/auth/challenges.ts';

export const prerender = false;

/** Finish passkey registration and store the credential. */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const env = locals.runtime.env;

  const response = (await request.json()) as RegistrationResponseJSON;
  const challenge = await takeChallenge(env.SESSION, `reg:${user.id}`);
  if (!challenge || challenge.purpose !== 'register') {
    return Response.json({ error: 'no_challenge' }, { status: 400 });
  }

  const result = await verifyRegistration(response, challenge.challenge, env.PASSKEY_RP_ID, env.PASSKEY_ORIGIN);
  if (!result.verified || !result.registrationInfo) {
    return Response.json({ verified: false }, { status: 400 });
  }

  const cred = result.registrationInfo.credential;
  await addCredential(
    env.DB,
    {
      credentialId: cred.id,
      userId: user.id,
      publicKey: cred.publicKey,
      counter: cred.counter,
      transports: cred.transports ?? [],
      deviceName: 'Passkey',
    },
    new Date().toISOString(),
  );
  return Response.json({ verified: true });
};
