import type { ManifestShortcut } from './web-manifest.ts';

const icons = [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }] as const;

/**
 * What a long-press on the launcher icon offers. Three, because Android shows
 * at most four and the fourth would be filler.
 *
 * The order states what the app is for: making an event comes first. /map has
 * no region in it deliberately — it lands in whichever region is the default,
 * and pinning one here would freeze that choice into every installation.
 */
export const MANIFEST_SHORTCUTS: readonly ManifestShortcut[] = [
  {
    name: 'Add an event',
    short_name: 'Add',
    description: 'Publish something you are putting on',
    url: '/submit/',
    icons,
  },
  { name: 'Map', short_name: 'Map', description: "What's on around you", url: '/map', icons },
  { name: 'Saved', short_name: 'Saved', description: 'Events you starred', url: '/favorites/', icons },
];
