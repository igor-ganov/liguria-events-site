/**
 * A glyph by reference: a small `<svg>` that points at a drawing the page
 * carries once (see feedSprite) instead of repeating it. `className` decides
 * how it is stroked — the drawing itself has no paint of its own.
 */
export const spriteUse = (name: string, size: number, className: string): string =>
  `<svg class="${className}" width="${size}" height="${size}" aria-hidden="true"><use href="#ic-${name}"/></svg>`;
