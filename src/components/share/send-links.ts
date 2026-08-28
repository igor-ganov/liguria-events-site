/** Where a link can be sent without the browser having a share sheet. */
export type SendLinks = Readonly<{ whatsapp: string; telegram: string }>;

/**
 * Straight into the two apps people here actually use. The native sheet is the
 * better route on a phone and is used when the browser has one — but on a
 * desktop it usually has none, and "copied to clipboard" asks somebody to go
 * and find the chat themselves.
 */
export const sendLinks = (url: string, title: string): SendLinks => ({
  whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
});
