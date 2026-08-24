/** Titles are scraped from other people's pages: an unescaped ampersand turns
 *  the whole frame into a parse error rather than a slide. */
export const escapeXml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
