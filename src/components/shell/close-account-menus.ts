/** Escape closes every profile dropdown, wherever the focus happens to be. */
export const closeAccountMenus = (): void => {
  document
    .querySelectorAll('[data-acct-dropdown]')
    .forEach((panel) => panel.setAttribute('hidden', ''));
  document
    .querySelectorAll('[data-acct-toggle]')
    .forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
};
