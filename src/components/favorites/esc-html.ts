/** Escape a value for interpolation into a client-built HTML string, in text or
 *  in an attribute. Numeric entities — the exact escaping the route markup has
 *  always emitted, so the rendered DOM is byte-for-byte unchanged. */
export const escHtml = (value: string): string =>
  value.replace(/[<>&"]/g, (char) => `&#${char.charCodeAt(0)};`);
