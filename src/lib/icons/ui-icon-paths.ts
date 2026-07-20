/** Inner SVG markup for chrome/UI icons — 24×24 viewBox, stroke=currentColor,
 *  feather-style, matching src/lib/icons/icon-paths.ts. Keyed by a stable name. */
export const UI_ICON_PATHS = {
  feed: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  calendar: '<rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v3M16 3v3"/>',
  map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z"/><path d="M9 4v14M15 6v14"/>',
  pin: '<path d="M12 21s-6.5-5.3-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.7 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.4"/>',
  places: '<path d="M4.5 9 6 4.5h12L19.5 9z"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M4.5 9a2.4 2.4 0 0 0 4.6 0 2.4 2.4 0 0 0 4.8 0 2.4 2.4 0 0 0 4.6 0"/><path d="M10 20v-5h4v5"/>',
  bot: '<rect x="4.5" y="8.5" width="15" height="11" rx="2.5"/><path d="M12 8.5V5"/><circle cx="12" cy="3.8" r="1.3"/><path d="M9.5 13.5h.01M14.5 13.5h.01"/><path d="M2.8 12.5v3M21.2 12.5v3"/>',
  ical: '<rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v3M16 3v3"/><path d="M12 12v5M9.5 14.5 12 17l2.5-2.5"/>',
  gem: '<path d="M5 8h14l-7 13z"/><path d="M5 8 8 3.5h8L19 8"/><path d="M9 8l3 13 3-13M9 8l3-4.5L15 8"/>',
  ticket: '<path d="M4 7h16v3.2a1.8 1.8 0 0 0 0 3.6V17H4v-3.2a1.8 1.8 0 0 0 0-3.6z"/><path d="M10 7.5v9" stroke-dasharray="1.6 2"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  star: '<path d="M12 2.8l2.9 6 6.5.9-4.7 4.6 1.1 6.5L12 17.7 6.1 20.8l1.1-6.5L2.5 9.7l6.5-.9z"/>',
  phone: '<path d="M6.5 3.5H10l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3.5a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z"/>',
  external: '<path d="M14 5h5v5M19 5l-8 8M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5"/>',
  wiki: '<path d="M3 7h4M4.5 7l4 10 3.5-8 3.5 8 4-10M17 7h4"/><path d="M10 7h4"/>',
  key: '<circle cx="8" cy="8" r="4.5"/><path d="M11.2 11.2 20 20M17 17l2-2M14.5 14.5l2-2"/>',
} as const;

export type UiIconName = keyof typeof UI_ICON_PATHS;
