/** Inner SVG markup for the ways of getting about a route draws — on foot, by
 *  bus, train, metro, funicular, car and ferry. Same 24×24 feather style as
 *  ui-icon-paths.ts; merged into UI_ICON_PATHS there. */
export const MODE_ICON_PATHS = {
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M9.5 21l2.5-6.5 3 2.5v4M12 14.5l1.2-6-3.7 1.5L8 13.5M13.2 8.5l1.8 3 3 1"/>',
  bus: '<rect x="5" y="3.5" width="14" height="14" rx="2.5"/><path d="M5 11.5h14M5 7.5h14M8.5 14.5h.01M15.5 14.5h.01M7.5 17.5V20M16.5 17.5V20"/>',
  train: '<rect x="6" y="3.5" width="12" height="13" rx="3"/><path d="M6 10h12M9 13.5h.01M15 13.5h.01M9 16.5l-2.5 4M15 16.5l2.5 4M7.8 18.5h8.4"/>',
  metro: '<circle cx="12" cy="12" r="8.5"/><path d="M8 16V8.5l4 5 4-5V16"/>',
  funicular: '<path d="M3 6.5 21 3M12 5v3.5"/><rect x="5.5" y="8.5" width="13" height="11" rx="2"/><path d="M5.5 13.5h13M12 8.5v5"/>',
  car: '<path d="M5 17H3.5v-4.5l2-5.5h13l2 5.5V17H19M9 17h6M3.5 12.5h17"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  ferry: '<path d="M3.5 15 12 12.5l8.5 2.5-2 4.5h-13z"/><path d="M6.5 14V9h11v5M12 9V5.5M10 5.5h4"/>',
} as const;
