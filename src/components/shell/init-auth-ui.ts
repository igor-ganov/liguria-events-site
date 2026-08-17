import { authActions } from './auth-actions.ts';
import { bindAccountMenus } from './bind-account-menus.ts';
import { bindSigninForms } from './bind-signin-forms.ts';
import { hasWebAuthn } from './has-web-authn.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { openSignin } from './open-signin.ts';
import { passkeyRegister } from './passkey-register.ts';
import { refreshAccount } from './refresh-account.ts';
import { stripAuthParams } from './strip-auth-params.ts';
import type { AuthAction } from './auth-actions.ts';

const HANDLERS: Readonly<Record<AuthAction, () => void>> = {
  open: openSignin,
  strip: stripAuthParams,
  register: () => void passkeyRegister(),
};

/** Sign-in dialog + header account state. Most pages are prerendered, so the
 *  header cannot know the viewer server-side — the account slot is resolved
 *  client-side from /api/auth/me. Re-run after SPA swaps (the DOM is replaced). */
export const initAuthUi = async (): Promise<void> => {
  bindAccountMenus();
  bindSigninForms();
  const user = await refreshAccount();
  authActions(location.search, isDefined(user), hasWebAuthn()).forEach((action) =>
    HANDLERS[action](),
  );
};
