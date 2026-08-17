// The three-way cycle the toggle walks: light → dark → system.
const NEXT: Readonly<Record<string, string>> = { light: 'dark', dark: 'system', system: 'light' };

/** The preference one tap moves to; an unrecognised stored value restarts the
 *  cycle at light. */
export const nextThemePref = (pref: string): string => NEXT[pref] ?? 'light';
