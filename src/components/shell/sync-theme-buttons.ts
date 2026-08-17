import { setText } from '../../lib/dom/set-text.ts';
import { themeNameKey } from '../../lib/theme/theme-name-key.ts';

/** Relabel every toggle with the current mode (aria label + visible menu
 *  label), so the control reads correctly to a screen reader too. */
export const syncThemeButtons = (pref: string): void => {
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((button) => {
    const name = button.dataset[themeNameKey(pref)] ?? pref;
    button.setAttribute('aria-label', `${button.dataset['label'] ?? ''} (${name})`);
    setText(button.querySelector<HTMLElement>('[data-theme-name]') ?? undefined, name);
  });
};
