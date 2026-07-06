import type { APIRoute } from 'astro';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { verifyRegistration } from '../../../lib/auth/passkey.ts';
import { addCredential } from '../../../lib/auth/credentials.ts';
import { takeChallenge } from '../../../lib/auth/challenges.ts';

export const prerender = false;

/** Finish passkey registration: consume the challenge (bound to this user) and store the credential. */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const env = locals.runtime.env;

  const body = (await request.json().catch(() => ({}))) as {
    challengeId?: string;
    response?: RegistrationResponseJSON;
  };
  if (!body.challengeId || !body.response) return Response.json({ error: 'bad_request' }, { status: 400 });

  const challenge = await takeChallenge(env.DB, body.challengeId);
  if (!challenge || challenge.purpose !== 'register' || challenge.userId !== user.id) {
    return Response.json({ error: 'invalid_challenge' }, { status: 400 });
  }

  const result = await verifyRegistration(body.response, challenge.challenge, env.PASSKEY_RP_ID, env.PASSKEY_ORIGIN);
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
  return Response.json({ ok: true, verified: true });
};
