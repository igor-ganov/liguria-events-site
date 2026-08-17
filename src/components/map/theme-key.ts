import { branch } from '../../lib/branch.ts';
import { isDark } from './is-dark.ts';

/** Which basemap the site theme asks for: 'light' is OSM Bright (colourful,
 *  high contrast), 'dark' a retuned Dark Matter. */
export const themeKey = (): string =>
  branch(isDark())(
    () => 'dark',
    () => 'light',
  );
