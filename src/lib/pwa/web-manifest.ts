/** The slice of the Web App Manifest this site declares — nothing wider, so a
 *  field that stops being written stops type-checking rather than going quiet. */
export type ManifestIcon = Readonly<{
  src: string;
  sizes: string;
  type: 'image/png';
  purpose?: 'any' | 'maskable';
}>;

export type ManifestShortcut = Readonly<{
  name: string;
  short_name: string;
  description: string;
  url: string;
  icons: readonly ManifestIcon[];
}>;

export type WebManifest = Readonly<{
  id: string;
  name: string;
  short_name: string;
  description: string;
  lang: string;
  dir: 'ltr';
  start_url: string;
  scope: string;
  display: 'standalone';
  display_override: readonly string[];
  background_color: string;
  theme_color: string;
  categories: readonly string[];
  icons: readonly ManifestIcon[];
  shortcuts: readonly ManifestShortcut[];
}>;
