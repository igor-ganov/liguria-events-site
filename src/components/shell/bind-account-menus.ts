import { closeAccountMenus } from './close-account-menus.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { isElement } from '../../lib/dom/is-element.ts';
import { openSignin } from './open-signin.ts';
import { signOut } from './sign-out.ts';
import { syncAccountMenus } from './sync-account-menus.ts';

// Ordered: a click inside one of these acts and never also toggles a menu.
const CLICKS: Readonly<Record<string, () => void>> = {
  '[data-signin]': openSignin,
  '[data-signout]': () => void signOut(),
};

const onClick = (target: Element): void => {
  const hit = Object.keys(CLICKS).find((selector) => isDefined(target.closest(selector) ?? undefined));
  [hit].filter(isDefined).forEach((selector) => CLICKS[selector]?.());
  [target]
    .filter(() => hit === undefined)
    .forEach((el) => syncAccountMenus(el.closest('[data-acct-toggle]') ?? undefined));
};

let bound = false;

/** One delegated document handler for every account/menu interaction, so it
 *  survives SPA swaps without accumulating listeners. */
export const bindAccountMenus = (): void => {
  [bound]
    .filter((already) => already === false)
    .forEach(() => {
      bound = true;
      document.addEventListener('click', (event) => {
        [event.target].filter(isElement).forEach(onClick);
      });
      document.addEventListener('keydown', (event) => {
        [event.key].filter((key) => key === 'Escape').forEach(closeAccountMenus);
      });
    });
};
