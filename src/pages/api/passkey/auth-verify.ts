import type { APIRoute } from 'astro';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { verifyAuthentication } from '../../../lib/auth/passkey.ts';
import { getCredential, bumpCounter } from '../../../lib/auth/credentials.ts';
import { takeChallenge } from '../../../lib/auth/challenges.ts';
import { signSession, SESSION_COOKIE } from '../../../lib/auth/session.ts';

export const prerender = false;

/** Finish passkey sign-in and issue a session. */
export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = locals.runtime.env;
  const body = (await request.json()) as { sessionId?: string; response?: AuthenticationResponseJSON };
  if (!body.sessionId || !body.response) return Response.json({ error: 'bad_request' }, { status: 400 });

  const challenge = await takeChallenge(env.SESSION, `auth:${body.sessionId}`);
  if (!challenge || challenge.purpose !== 'auth') {
    return Response.json({ error: 'no_challenge' }, { status: 400 });
  }

  const credential = await getCredential(env.DB, body.response.id);
  if (!credential) return Response.json({ verified: false }, { status: 400 });

  const result = await verifyAuthentication(
    body.response,
    challenge.challenge,
    env.PASSKEY_RP_ID,
    env.PASSKEY_ORIGIN,
    credential,
  );
  if (!result.verified) return Response.json({ verified: false }, { status: 400 });

  const now = new Date();
  await bumpCounter(env.DB, credential.credentialId, result.authenticationInfo.newCounter, now.toISOString());
  const session = await signSession(env.SESSION_SECRET, credential.userId, now.getTime());
  cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 3600,
  });
  return Response.json({ verified: true });
};
