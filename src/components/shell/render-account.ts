import { AUTH_UI } from './auth-ui.ts';
import { accountSlotMarkup } from './account-slot-markup.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { signedOutMarkup } from './signed-out-markup.ts';
import type { AccountUser } from './account-user.ts';

const markup = (user: AccountUser | undefined, flat: boolean): string =>
  [user].filter(isDefined).map((viewer) => accountSlotMarkup(viewer, AUTH_UI, flat))[0] ??
  signedOutMarkup(AUTH_UI);

/** Draw every account slot on the page: the header's dropdown trigger, and the
 *  mobile FAB's flat list. */
export const renderAccount = (user: AccountUser | undefined): void => {
  document.querySelectorAll('[data-account]').forEach((slot) => {
    slot.innerHTML = markup(user, slot.classList.contains('fab-account'));
  });
};
