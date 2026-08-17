import { isDefined } from '../../lib/is-defined.ts';

/** Open the dropdown the click landed in — if it was closed — and close every
 *  other one. One pass over all of them, so a second tap on the same trigger
 *  closes it and a tap anywhere else closes them all. */
export const syncAccountMenus = (toggle: Element | undefined): void => {
  document.querySelectorAll<HTMLElement>('[data-acct-menu]').forEach((menu) => {
    const trigger = menu.querySelector<HTMLElement>('[data-acct-toggle]') ?? undefined;
    [menu.querySelector<HTMLElement>('[data-acct-dropdown]') ?? undefined]
      .filter(isDefined)
      .filter(() => isDefined(trigger))
      .forEach((panel) => {
        const open = isDefined(toggle) && menu.contains(toggle) && panel.hasAttribute('hidden');
        panel.toggleAttribute('hidden', open === false);
        trigger?.setAttribute('aria-expanded', String(open));
      });
  });
};
