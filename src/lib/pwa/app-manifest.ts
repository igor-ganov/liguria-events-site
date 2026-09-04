import { MANIFEST_ICONS } from './manifest-icons.ts';
import { MANIFEST_SHORTCUTS } from './manifest-shortcuts.ts';
import type { WebManifest } from './web-manifest.ts';

/**
 * The installed app's identity — read by the browser on "add to home screen"
 * and by Bubblewrap when it generates the Android wrapper, which is why the
 * name, the icons and the theme colour are fixed here rather than typed twice.
 *
 * `id` is '/' and stays '/': the browser otherwise derives an identity from
 * start_url, and the day start_url moves every existing installation becomes a
 * different app that no update can reach.
 *
 * start_url is '/' rather than a region's feed for the same reason — the
 * default region is a decision the site makes per request, and freezing one
 * into the manifest would outlive the decision.
 */
export const appManifest = (): WebManifest => ({
  id: '/',
  name: "Dove Go — what's on in Italy",
  short_name: 'Dove Go',
  description: 'Find events near you across Italy, and publish your own in a minute.',
  lang: 'en',
  dir: 'ltr',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  display_override: ['standalone', 'minimal-ui'],
  background_color: '#fbfaf7',
  theme_color: '#fbfaf7',
  categories: ['events', 'travel', 'lifestyle'],
  icons: MANIFEST_ICONS,
  shortcuts: MANIFEST_SHORTCUTS,
});
