import type { APIRoute } from 'astro';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { verifyAuthentication } from '../../../lib/auth/passkey.ts';
import { getCredential, bumpCounter } from '../../../lib/auth/credentials.ts';
import { takeChallenge } from '../../../lib/auth/challenges.ts';
import { signSession, SESSION_COOKIE, sessionCookie } from '../../../lib/auth/session.ts';
import { gatedResponse } from '../../../lib/gated-response.ts';

export const prerender = false;

const badRequest = () => Response.json({ error: 'bad_request' }, { status: 400 });
const invalidChallenge = () => Response.json({ error: 'invalid_challenge' }, { status: 400 });
const unverified = () => Response.json({ verified: false }, { status: 400 });

/** Finish passkey sign-in: consume the challenge, verify, issue a session. Each
 *  gate refuses on exactly what the original guard clause refused on, and the
 *  step it guarded never runs for a refused request. */
export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = locals.runtime.env;
  const body = (await request.json().catch(() => ({}))) as {
    challengeId?: string;
    response?: AuthenticationResponseJSON;
  };
  return gatedResponse(body.challengeId, (id) => Boolean(id))(badRequest)((challengeId) =>
    gatedResponse(body.response, (res) => Boolean(res))(badRequest)(async (response) => {
      const taken = await takeChallenge(env.DB, challengeId);
      return gatedResponse(taken ?? undefined, (c) => c.purpose === 'auth')(invalidChallenge)(async (challenge) => {
        const found = await getCredential(env.DB, response.id);
        return gatedResponse(found ?? undefined)(unverified)(async (credential) => {
          const result = await verifyAuthentication(
            response,
            challenge.challenge,
            env.PASSKEY_RP_ID,
            env.PASSKEY_ORIGIN,
            credential,
          );
          return gatedResponse(result, (r) => r.verified)(unverified)(async (verified) => {
            const now = new Date();
            await bumpCounter(env.DB, credential.credentialId, verified.authenticationInfo.newCounter, now.toISOString());
            const session = await signSession(env.SESSION_SECRET, credential.userId, now.getTime());
            cookies.set(SESSION_COOKIE, session, {
              ...sessionCookie(env.ENVIRONMENT === 'production'),
              maxAge: 7 * 24 * 3600,
            });
            return Response.json({ ok: true, verified: true });
          });
        });
      });
    }),
  );
};
