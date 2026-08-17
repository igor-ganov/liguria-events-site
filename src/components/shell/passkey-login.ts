import { AUTH_UI } from './auth-ui.ts';
import { branch } from '../../lib/branch.ts';
import { hasWebAuthn } from './has-web-authn.ts';
import { setSigninStatus } from './set-signin-status.ts';
import { startAuthentication } from '@simplewebauthn/browser';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';

type AuthOptions = Readonly<{
  challengeId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
}>;

let busy = false;

const settle = (res: Response): void =>
  branch(res.ok)(
    () => location.reload(),
    () => setSigninStatus(AUTH_UI.passkeyFailed),
  );

const ceremony = async (): Promise<void> => {
  const res = await fetch('/api/passkey/auth-options', { method: 'POST' });
  const opt: AuthOptions = await res.json();
  const response = await startAuthentication({ optionsJSON: opt.options });
  setSigninStatus(AUTH_UI.verifying);
  settle(
    await fetch('/api/passkey/auth-verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ challengeId: opt.challengeId, response }),
    }),
  );
};

const attempt = async (): Promise<void> => {
  try {
    await ceremony();
  } catch {
    // Cancelled the passkey sheet, or none was offered — the email form is
    // right here, so we clear the status and let them type their email.
    setSigninStatus('');
  } finally {
    busy = false;
  }
};

/** Passkey sign-in via the MODAL ceremony (not autofill): the browser offers
 *  BOTH a local passkey AND "use a passkey on another device" over QR — the
 *  only way to sign in on a phone with the passkey kept on a laptop. Nothing
 *  hangs: the promise settles on use or on cancel. */
export const passkeyLogin = async (): Promise<void> => {
  const runs = [attempt].filter(() => hasWebAuthn()).filter(() => busy === false);
  runs.forEach(() => {
    busy = true;
  });
  await Promise.all(runs.map((run) => run()));
};
