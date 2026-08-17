import { bindOnce } from '../../lib/dom/bind-once.ts';
import { cycleTheme } from './cycle-theme.ts';
import { prefersDark } from './prefers-dark.ts';
import { resolveTheme } from '../../lib/theme/resolve-theme.ts';
import { syncThemeButtons } from './sync-theme-buttons.ts';

// While on 'system', follow live OS scheme changes (no reveal).
const followSystem = (): void => {
  const html = document.documentElement;
  [html.dataset['themePref']]
    .filter((pref) => pref === 'system')
    .forEach(() => {
      html.dataset['theme'] = resolveTheme('system', prefersDark.matches);
    });
};

const bind = (): void => {
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((button) => {
    bindOnce(button, 'themeBound', (el) => el.addEventListener('click', cycleTheme));
  });
  syncThemeButtons(document.documentElement.dataset['themePref'] ?? 'system');
};

/** Wire every theme toggle on the page and rebind after an SPA swap. The
 *  no-flash script in <head> has already applied the stored preference; this
 *  only makes it changeable. */
export const initThemeToggle = (): void => {
  prefersDark.addEventListener('change', followSystem);
  bind();
  document.addEventListener('astro:after-swap', bind);
};
