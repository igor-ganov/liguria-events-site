import type { Category } from '../events/categories.ts';

/** Inner SVG markup per category — 24×24 viewBox, stroke=currentColor
 *  (feather-style line icons; consumed by both Lit and Astro wrappers). */
export const ICON_PATHS: Readonly<Record<Category, string>> = {
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  theatre:
    '<path d="M3 4h10v7a5 5 0 0 1-10 0z"/><path d="M11 8h10v7a5 5 0 0 1-9.5 2.1"/><path d="M6 8.5h.01M10 8.5h.01M14 12.5h.01M18 12.5h.01"/><path d="M6.5 11.5c.5.6 1.5.6 2 0"/>',
  art: '<circle cx="13.5" cy="6.5" r=".8"/><circle cx="17.5" cy="10.5" r=".8"/><circle cx="8.5" cy="7.5" r=".8"/><circle cx="6.5" cy="12.5" r=".8"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.8-.7 1.8-1.8 0-.4-.2-.9-.5-1.2-.3-.3-.4-.7-.4-1.2 0-.9.7-1.8 1.8-1.8H17c2.8 0 5-2.2 5-5C22 6 17.5 2 12 2z"/>',
  food: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
  sport:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 0 20M2 12h20M12 2a15 15 0 0 0 0 20"/>',
  family:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  market:
    '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  nightlife:
    '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><path d="M19 3v4M17 5h4"/>',
  culture:
    '<path d="M2 20h20M4 20V9m4 11V9m8 11V9m4 11V9"/><path d="M2 9l10-6 10 6z"/>',
  workshop:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  other:
    '<path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z"/>',
};
