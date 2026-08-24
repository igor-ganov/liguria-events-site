import { branch } from '../branch.ts';

const ELLIPSIS = '…';

/** The last word boundary before the limit, or the hard cut when a single
 *  token is longer than the whole allowance. */
const atBoundary = (text: string, limit: number): string => {
  const head = text.slice(0, limit);
  const cut = head.lastIndexOf(' ');
  return branch(cut > 0)<string>(
    () => head.slice(0, cut),
    () => head,
  );
};

/** Meta descriptions are read in a link preview, which shows about two lines.
 *  Scraped copy arrives with the article's own line breaks, so flatten first. */
export const clipText = (text: string, limit: number): string => {
  const flat = text.replace(/\s+/g, ' ').trim();
  return branch(flat.length <= limit)<string>(
    () => flat,
    () => `${atBoundary(flat, limit)}${ELLIPSIS}`,
  );
};
