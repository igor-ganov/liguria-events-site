import { branch } from '../../lib/branch.ts';
import type { AccountUser } from './account-user.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

const adminLinks = (user: AccountUser, auth: Ui['auth']): string =>
  branch(user.role === 'admin')(
    () =>
      `<a role="menuitem" href="/admin/">${auth.moderation}</a>` +
      `<a role="menuitem" href="/admin/users/">${auth.users}</a>`,
    () => '',
  );

/** The profile menu's actions, in the order they are offered. Moderation and
 *  Users are there for admins only. */
export const accountMenuItems = (user: AccountUser, auth: Ui['auth']): string =>
  `<a role="menuitem" class="account-submit" href="/submit">+ ${auth.addEvent}</a>` +
  adminLinks(user, auth) +
  `<a role="menuitem" href="/settings">${auth.settings}</a>` +
  `<button type="button" role="menuitem" class="account-signout" data-signout>${auth.signOut}</button>`;
