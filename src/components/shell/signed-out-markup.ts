import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** The account slot before sign-in: one button, the same footprint as the
 *  profile trigger that replaces it, so nothing shifts when the viewer resolves. */
export const signedOutMarkup = (auth: Ui['auth']): string =>
  `<button type="button" class="account-signin" data-signin>${auth.signIn}</button>`;
