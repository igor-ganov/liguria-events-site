import { isHtmlElement } from './is-html-element.ts';

/** An element's children, as the HTMLElements a script can show and hide. */
export const htmlChildren = (parent: HTMLElement): readonly HTMLElement[] =>
  Array.from<unknown>(parent.children).filter(isHtmlElement);
