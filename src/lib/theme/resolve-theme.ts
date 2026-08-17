import { branch } from '../branch.ts';

/** The scheme actually painted: 'system' follows the OS, any other preference
 *  is taken at face value. data-theme carries this; data-theme-pref carries the
 *  choice it came from. */
export const resolveTheme = (pref: string, prefersDark: boolean): string =>
  branch(pref === 'system')(
    () =>
      branch(prefersDark)(
        () => 'dark',
        () => 'light',
      ),
    () => pref,
  );
