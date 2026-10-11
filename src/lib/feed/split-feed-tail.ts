const OPEN = '<template data-feed-tail>';
const CLOSE = '</template>';

export type SplitFeed = Readonly<{ page: string; tail: string }>;

const cut = (html: string, from: number, addressOf: (tail: string) => string): SplitFeed => {
  const start = from + OPEN.length;
  const end = html.indexOf(CLOSE, start);
  const tail = html.slice(start, end);
  const address = addressOf(tail);
  const hollow = `<template data-feed-tail data-src="${address}"></template><link rel="prefetch" href="${address}">`;
  return { page: `${html.slice(0, from)}${hollow}${html.slice(end + CLOSE.length)}`, tail };
};

/**
 * Take the folded days of a built feed page out of it. They were inert in a
 * `<template>`, which costs the browser nothing to hold and the reader three
 * quarters of the page to download before the first day is painted. The page
 * keeps an empty template that names the file they went to, and a hint to
 * fetch that file once the page is up, so it is there before it is asked for.
 * Undefined for a page that folds nothing.
 */
export const splitFeedTail = (html: string, addressOf: (tail: string) => string): SplitFeed | undefined =>
  [html.indexOf(OPEN)]
    .filter((from) => from >= 0)
    .map((from) => cut(html, from, addressOf))
    .at(0);
