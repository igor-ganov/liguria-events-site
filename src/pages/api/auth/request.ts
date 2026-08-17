import type { APIRoute } from 'astro';
import { issueMagicLogin } from '../../../lib/auth/magic.ts';
import { sendMagicLink } from '../../../lib/auth/email.ts';
import { gatedResponse } from '../../../lib/gated-response.ts';
import { isDefined } from '../../../lib/is-defined.ts';
import { jsonField } from '../../../lib/json-field.ts';

export const prerender = false;

const isEmail = (value: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

const invalidEmail = () => Response.json({ error: 'invalid_email' }, { status: 400 });

/** Request a sign-in link + code. Always reports success (no account
 *  enumeration), and a rate-limited request sends nothing — a 0-or-1 issue. */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const body = await request.json().catch(() => ({}));
  const email = (jsonField(body, 'email') ?? '').trim();
  return gatedResponse(email, isEmail)(invalidEmail)(async (address) => {
    const login = await issueMagicLogin(env.SESSION, address);
    await Promise.all(
      [login ?? undefined].filter(isDefined).map((issued) =>
        sendMagicLink(
          env.RESEND_API_KEY,
          env.MAIL_FROM,
          address,
          `${env.PUBLIC_ORIGIN}/auth/verify?t=${issued.token}`,
          issued.code,
        ),
      ),
    );
    return Response.json({ ok: true });
  });
};
