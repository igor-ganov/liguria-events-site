import type { APIRoute } from 'astro';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { verifyRegistration } from '../../../lib/auth/passkey.ts';
import { addCredential } from '../../../lib/auth/credentials.ts';
import { takeChallenge } from '../../../lib/auth/challenges.ts';
import { gatedResponse } from '../../../lib/gated-response.ts';

export const prerender = false;

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });
const badRequest = () => Response.json({ error: 'bad_request' }, { status: 400 });
const invalidChallenge = () => Response.json({ error: 'invalid_challenge' }, { status: 400 });
const unverified = () => Response.json({ verified: false }, { status: 400 });

/** Finish passkey registration: consume the challenge (bound to this user) and
 *  store the credential. */
export const POST: APIRoute = ({ request, locals }) =>
  gatedResponse(locals.user)(unauthorized)(async (user) => {
    const env = locals.runtime.env;
    const body = (await request.json().catch(() => ({}))) as {
      challengeId?: string;
      response?: RegistrationResponseJSON;
    };
    return gatedResponse(body.challengeId, (id) => Boolean(id))(badRequest)((challengeId) =>
      gatedResponse(body.response, (res) => Boolean(res))(badRequest)(async (response) => {
        const taken = await takeChallenge(env.DB, challengeId);
        const mine = (c: { purpose: string; userId?: string }) => c.purpose === 'register' && c.userId === user.id;
        return gatedResponse(taken ?? undefined, mine)(invalidChallenge)(async (challenge) => {
          const result = await verifyRegistration(response, challenge.challenge, env.PASSKEY_RP_ID, env.PASSKEY_ORIGIN);
          return gatedResponse(result, (r) => r.verified)(unverified)(() =>
            gatedResponse(result.registrationInfo)(unverified)(async (info) => {
              await addCredential(
                env.DB,
                {
                  credentialId: info.credential.id,
                  userId: user.id,
                  publicKey: info.credential.publicKey,
                  counter: info.credential.counter,
                  transports: info.credential.transports ?? [],
                  deviceName: 'Passkey',
                },
                new Date().toISOString(),
              );
              return Response.json({ ok: true, verified: true });
            }),
          );
        });
      }),
    );
  });
