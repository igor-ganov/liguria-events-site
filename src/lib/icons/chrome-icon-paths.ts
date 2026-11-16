/** Inner SVG markup for the interface's own controls — the arrows, crosses and
 *  marks that used to be Unicode glyphs. Same 24×24 feather style as
 *  ui-icon-paths.ts; merged into UI_ICON_PATHS there. */
export const CHROME_ICON_PATHS = {
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  chevronDown: '<path d="M6.5 9.5 12 15l5.5-5.5"/>',
  chevronLeft: '<path d="M14.5 6.5 9 12l5.5 5.5"/>',
  chevronRight: '<path d="M9.5 6.5 15 12l-5.5 5.5"/>',
  transfer: '<path d="M4 8.5h15M15.5 5l3.5 3.5-3.5 3.5M20 15.5H5M8.5 12 5 15.5 8.5 19"/>',
  warning: '<path d="M12 4 3 19.5h18z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  pause: '<rect x="6.5" y="5.5" width="3.5" height="13" rx="1"/><rect x="14" y="5.5" width="3.5" height="13" rx="1"/>',
  home: '<path d="M3.5 11.5 12 4.5l8.5 7"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5.5h4V20"/>',
  flag: '<path d="M5.5 21V4"/><path d="M5.5 4.5h12.5l-3 4 3 4H5.5"/>',
  pushpin: '<path d="M9 3.5h6M10 3.5v5.5l-3.5 3.5h11L14 9V3.5M12 12.5V21"/>',
  grip: '<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="3"/>',
} as const;
