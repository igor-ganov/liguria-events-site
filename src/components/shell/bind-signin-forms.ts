import { bindOnce } from '../../lib/dom/bind-once.ts';
import { passkeyLogin } from './passkey-login.ts';
import { setSigninStatus } from './set-signin-status.ts';
import { showSigninStep } from './show-signin-step.ts';
import { submitCode } from './submit-code.ts';
import { submitEmail } from './submit-email.ts';

const el = <T extends HTMLElement>(selector: string): T | undefined =>
  document.querySelector<T>(selector) ?? undefined;

const onSubmit =
  (send: (form: HTMLFormElement) => Promise<void>) =>
  (form: HTMLFormElement): void => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void send(form);
    });
  };

const toEmailStep = (): void => {
  showSigninStep('email');
  setSigninStatus('');
};

/** The dialog's two forms and its two buttons, each bound exactly once — the
 *  dialog itself is server-rendered into every page, so a swap must not stack
 *  handlers on it. */
export const bindSigninForms = (): void => {
  bindOnce(el<HTMLFormElement>('#signin-form'), 'emailBound', onSubmit(submitEmail));
  bindOnce(el<HTMLFormElement>('#code-form'), 'bound', onSubmit(submitCode));
  bindOnce(el('[data-code-back]'), 'bound', (back) =>
    back.addEventListener('click', toEmailStep),
  );
  bindOnce(el('[data-passkey-retry]'), 'bound', (retry) =>
    retry.addEventListener('click', () => void passkeyLogin()),
  );
};
