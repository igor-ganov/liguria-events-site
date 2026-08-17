const REPLACEMENT: Readonly<Record<string, string>> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
};

/** Escape a value for interpolation into a client-built HTML string, in text or
 *  in an attribute. Cards are assembled as strings, so everything that comes
 *  from the data passes through here first. */
export const escapeMarkup = (value: string): string =>
  value.replace(/[<>&"]/g, (char) => REPLACEMENT[char] ?? char);
