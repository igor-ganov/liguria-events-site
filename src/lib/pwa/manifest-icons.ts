import type { ManifestIcon } from './web-manifest.ts';

/**
 * Rasterised from public/favicon.svg by scripts/build-icons.ts.
 *
 * Two sizes are the Android minimum (192 for the launcher, 512 for the splash
 * screen and the store listing), and the maskable one is separate on purpose:
 * a launcher crops a maskable icon to whatever shape the device uses, so the
 * artwork needs the safe-zone padding the plain icon must not have.
 */
export const MANIFEST_ICONS: readonly ManifestIcon[] = [
  { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];
