import { prefersDark } from './prefers-dark.ts';
import { resolveTheme } from '../../lib/theme/resolve-theme.ts';
import { syncThemeButtons } from './sync-theme-buttons.ts';

/** Paint a preference and remember it: data-theme is the resolved scheme
 *  (drives colours + the map filter), data-theme-pref the user's choice
 *  (drives the toggle icon). */
export const applyThemePref = (pref: string): void => {
  const html = document.documentElement;
  html.dataset['theme'] = resolveTheme(pref, prefersDark.matches);
  html.dataset['themePref'] = pref;
  localStorage.setItem('theme', pref);
  syncThemeButtons(pref);
};
