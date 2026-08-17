/**
 * Escape a string for interpolation into a map popup's HTML attribute or text.
 * Popup markup is built as strings (maplibre takes HTML), so every value that
 * comes from event/landmark data passes through here first.
 */
export const escapeAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
