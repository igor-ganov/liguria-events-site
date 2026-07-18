import type { PlaceCategory } from './place-categories.ts';

/** Inner SVG markup per place category — 24×24 viewBox, stroke=currentColor,
 *  feather-style line icons matching src/lib/icons/icon-paths.ts. */
export const PLACE_ICON_PATHS: Readonly<Record<PlaceCategory, string>> = {
  restaurant:
    '<path d="M6 3v6M8.5 3v6M8 3v18M8 9a2.5 2.5 0 0 0 2.5-2.5"/><path d="M16 3c-1.4 1-2 3-2 5s1 3 2 3v10"/>',
  cafe:
    '<path d="M4 8h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M4 21h13"/><path d="M8 2.5v2M12 2.5v2"/>',
  bar:
    '<path d="M4 4h16l-8 8z"/><path d="M12 12v7M8 19h8"/><path d="M15 4l-3 3"/>',
  fastfood:
    '<path d="M4 10a8 8 0 0 1 16 0z"/><path d="M4 13.5h16"/><path d="M5 16.5h14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/>',
  icecream:
    '<path d="M8 9a4 4 0 0 1 8 0z"/><path d="M8.5 9 12 21l3.5-12"/><path d="M9 5.5a3 3 0 0 1 6 0"/>',
  nightlife:
    '<path d="M12 2.5l1.6 4.6L18 8.5l-4.4 1.4L12 14.5l-1.6-4.6L6 8.5l4.4-1.4z"/><circle cx="18.5" cy="17.5" r="1.1"/><circle cx="6" cy="16" r="1.1"/>',
  fitness:
    '<path d="M4 12h16"/><path d="M6.5 8v8M4.5 9.5v5M17.5 8v8M19.5 9.5v5"/>',
  climbing:
    '<path d="M3 20 10.5 7l4 6.5 2-3L21 20z"/><path d="M10.5 7V4l3 1-3 1"/>',
  sport:
    '<path d="M8 4h8v3.5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.5v.5a3 3 0 0 0 3 3M16 5.5h2.5v.5a3 3 0 0 1-3 3"/><path d="M12 11.5V16M9.5 20h5M10 16h4l1 4H9z"/>',
  cinema:
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M3 9.5h5M16 9.5h5M3 14.5h5M16 14.5h5"/>',
  entertainment:
    '<rect x="2.5" y="8.5" width="19" height="9" rx="4.5"/><path d="M8 12h3M9.5 10.5v3"/><circle cx="15.5" cy="11.8" r="1.05"/><circle cx="17.6" cy="14" r="1.05"/>',
  museum:
    '<path d="M3 9 12 4l9 5H3z"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9"/><path d="M3 21h18M4 18h16"/>',
  gallery:
    '<rect x="3" y="4.5" width="18" height="15" rx="1.5"/><path d="M3 15.5l5-4.5 4 3.5 3-2.5 6 5.5"/><circle cx="9" cy="9" r="1.4"/>',
  wellness:
    '<path d="M12 21c-4 0-7-2.8-7-6 2 0 5 .8 7 3.8 2-3 5-3.8 7-3.8 0 3.2-3 6-7 6z"/><path d="M12 15.5c-1.6-2.2-1.6-4.3 0-6.5 1.6 2.2 1.6 4.3 0 6.5z"/>',
  kids:
    '<circle cx="12" cy="8" r="5"/><path d="M12 13v5"/><path d="M10.5 20a1.5 1.5 0 0 0 3 0"/><path d="M10 7.5h.01M14 7.5h.01M10.5 10c.9.7 2.1.7 3 0"/>',
  shopping:
    '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
};

export const placeIconPath = (cat: PlaceCategory): string => PLACE_ICON_PATHS[cat] ?? PLACE_ICON_PATHS.restaurant;
