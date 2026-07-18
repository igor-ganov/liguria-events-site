import type { LandmarkKind } from './landmark-kinds.ts';

/** Inner SVG markup per landmark kind — 24×24 viewBox, stroke=currentColor,
 *  feather-style line icons matching src/lib/icons/icon-paths.ts. */
export const LANDMARK_ICON_PATHS: Readonly<Record<LandmarkKind, string>> = {
  castle:
    '<path d="M4 21V9h16v12"/><path d="M4 9V6h2v2h3V6h2v2h2V6h2v2h3V6h2v3"/><path d="M10 21v-5h4v5"/><path d="M3 21h18"/>',
  church:
    '<path d="M12 2v5M9.5 4h5"/><path d="M5 21V10l7-4 7 4v11"/><path d="M10 21v-5a2 2 0 0 1 4 0v5"/><path d="M3 21h18"/>',
  museum:
    '<path d="M3 9 12 4l9 5H3z"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9"/><path d="M3 21h18M4 18h16"/>',
  palace:
    '<path d="M12 3a2.4 2.4 0 0 0-2.4 2.4h4.8A2.4 2.4 0 0 0 12 3z"/><path d="M5 21V9h14v12"/><path d="M9 21v-5h6v5"/><path d="M5 9h14"/><path d="M3 21h18"/>',
  monument:
    '<path d="M9.5 8 12 3l2.5 5"/><path d="M10 8v10M14 8v10"/><path d="M8 18h8v3H8z"/><path d="M6 21h12"/>',
  tower:
    '<path d="M8 21V9h8v12"/><path d="M7 9 12 4l5 5"/><path d="M11 21v-6h2v6"/><path d="M8 13h8"/><path d="M6 21h12"/>',
  lighthouse:
    '<path d="M9.5 21 10 13h4l.5 8"/><path d="M9.5 13h5"/><path d="M10 13v-2h4v2"/><path d="M12 3v3M7.5 7 6 6M16.5 7 18 6"/><path d="M8 21h8"/>',
  square:
    '<path d="M12 4v3"/><path d="M9 6c0 2 6 2 6 0"/><path d="M7 21v-7a5 5 0 0 1 10 0v7"/><path d="M4 21h16M10 21v-4h4v4"/>',
  park:
    '<path d="M12 21v-4"/><path d="M9.5 17a5 5 0 1 1 5 0z"/><path d="M8 21h8"/>',
  heritage:
    '<path d="M5 21V8M9 21V8M13 21v-6M17 21V8"/><path d="M4 8h6M12 8h6"/><path d="M4 5h6"/><path d="M3 21h18"/>',
  beach:
    '<path d="M4 20c1.5-1 2.5-1 4 0s2.5 1 4 0 2.5-1 4 0 2.5 1 4 0"/><path d="M14 20V9"/><path d="M6.5 12a8 8 0 0 1 15 0z"/>',
  attraction:
    '<path d="M12 3.5 14.4 9l5.9.5-4.5 3.9 1.4 5.8L12 16.4l-5.2 2.8 1.4-5.8L3.7 9.5 9.6 9z"/>',
};
