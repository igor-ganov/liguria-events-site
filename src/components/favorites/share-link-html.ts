import { escHtml } from './esc-html.ts';

/** The "here is your link" line shown after a route is saved. */
export const shareLinkHtml = (url: string, label: string): string =>
  `<span>${escHtml(label)}</span> <a href="${url}">${escHtml(url)}</a>`;
