import { accountMenuItems } from './account-menu-items.ts';
import { branch } from '../../lib/branch.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import type { AccountUser } from './account-user.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

const dropdown = (user: AccountUser, auth: Ui['auth']): string => {
  const handle = escapeMarkup(user.handle);
  return (
    `<div class="acct-menu" data-acct-menu>` +
    `<button type="button" class="account-trigger" data-acct-toggle aria-haspopup="menu" aria-expanded="false" aria-label="${auth.account}">` +
    `<span class="acct-avatar" aria-hidden="true">${handle.slice(0, 1).toUpperCase()}</span>` +
    `<span class="acct-name">@${handle}</span>` +
    `</button>` +
    `<div class="acct-dropdown" data-acct-dropdown role="menu" hidden>${accountMenuItems(user, auth)}</div>` +
    `</div>`
  );
};

/** The signed-in header collapses to ONE profile button (same footprint as
 *  "Sign in"), so the reserved slot never shifts, and its menu holds the
 *  profile actions. The mobile FAB is already an open popup, so it gets the
 *  flat list instead of a nested dropdown. */
export const accountSlotMarkup = (user: AccountUser, auth: Ui['auth'], flat: boolean): string =>
  branch(flat)(
    () => accountMenuItems(user, auth),
    () => dropdown(user, auth),
  );
