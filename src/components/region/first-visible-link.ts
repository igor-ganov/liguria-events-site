import { htmlChildren } from '../../lib/dom/html-children.ts';

const isAnchor = (node: unknown): node is HTMLAnchorElement => node instanceof HTMLAnchorElement;

/** The link of the first row still on screen, as a 0-or-1 array. */
export const firstVisibleLink = (list: HTMLElement): readonly HTMLAnchorElement[] =>
  htmlChildren(list)
    .filter((row) => !row.hidden)
    .slice(0, 1)
    .flatMap((row) => {
      const found: unknown = row.querySelector('a');
      return [found].filter(isAnchor);
    });
