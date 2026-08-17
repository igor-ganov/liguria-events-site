import { hasWebAuthn } from './has-web-authn.ts';
import { passkeyLogin } from './passkey-login.ts';
import { setHidden } from '../../lib/dom/set-hidden.ts';
import { setSigninStatus } from './set-signin-status.ts';
import { showSigninStep } from './show-signin-step.ts';

const el = (selector: string): HTMLElement | undefined =>
  document.querySelector<HTMLElement>(selector) ?? undefined;

/** Open the dialog on its email step and auto-run the passkey ceremony: the
 *  email form stays visible, so dismissing the sheet just falls back to it. */
export const openSignin = (): void => {
  showSigninStep('email');
  setSigninStatus('');
  document.querySelector<HTMLDialogElement>('#signin-dialog')?.showModal();
  // Show the passkey retry affordance only where WebAuthn exists.
  setHidden(el('[data-passkey-retry]'), hasWebAuthn() === false);
  document.querySelector<HTMLInputElement>('#signin-form input[name=email]')?.focus();
  void passkeyLogin();
};
