// Each toggle carries the three mode names as data-name-* attributes, so the
// server renders them translated and the script only picks one.
const NAME_KEY: Readonly<Record<string, string>> = {
  light: 'nameLight',
  dark: 'nameDark',
  system: 'nameSystem',
};

/** Which data-name-* attribute of a toggle names the current mode. */
export const themeNameKey = (pref: string): string => NAME_KEY[pref] ?? 'nameSystem';
