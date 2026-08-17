/**
 * Escape a description before any Markdown is re-introduced. The input embeds
 * source text, so no raw HTML may survive; the `*` and `#` markers do, and the
 * renderers turn only those into markup.
 */
export const escapeDescriptionHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
