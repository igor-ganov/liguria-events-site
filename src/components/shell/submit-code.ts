import { AUTH_UI } from './auth-ui.ts';
import { branch } from '../../lib/branch.ts';
import { pendingEmail } from './pending-email.ts';
import { setSigninStatus } from './set-signin-status.ts';
import { verifyLanding } from './verify-landing.ts';

/** Verify the 6-digit code and, on success, reload as the signed-in viewer. */
export const submitCode = async (form: HTMLFormElement): Promise<void> => {
  const code = String(new FormData(form).get('code') ?? '').trim();
  setSigninStatus(AUTH_UI.verifying);
  const res = await fetch('/api/auth/verify-code', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: pendingEmail.value, code }),
  });
  const body: unknown = await res.json().catch(() => ({}));
  const landings = verifyLanding(res.ok, body);
  branch(landings.length > 0)(
    () =>
      landings.forEach((href) => {
        location.href = href;
      }),
    () => setSigninStatus(AUTH_UI.badCode),
  );
};
