import { AUTH_UI } from './auth-ui.ts';
import { branch } from '../../lib/branch.ts';
import { pendingEmail } from './pending-email.ts';
import { setSigninStatus } from './set-signin-status.ts';
import { setText } from '../../lib/dom/set-text.ts';
import { showSigninStep } from './show-signin-step.ts';

const toCodeStep = (): void => {
  setText(document.querySelector<HTMLElement>('[data-code-email]') ?? undefined, pendingEmail.value);
  showSigninStep('code');
  setSigninStatus('');
  document.querySelector<HTMLInputElement>('#code-form input[name=code]')?.focus();
};

/** Ask the server to email a sign-in code, then move to the code step. */
export const submitEmail = async (form: HTMLFormElement): Promise<void> => {
  pendingEmail.value = String(new FormData(form).get('email') ?? '');
  setSigninStatus(AUTH_UI.sending);
  const res = await fetch('/api/auth/request', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: pendingEmail.value }),
  });
  branch(res.ok)(
    () => toCodeStep(),
    () => setSigninStatus(AUTH_UI.invalidEmail),
  );
};
