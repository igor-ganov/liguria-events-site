import { isHtmlElement } from './is-html-element.ts';

/** Anything a selector runs against — the document, or an element. Typed
 *  structurally, so the DOM's overloads and @cloudflare/workers-types never
 *  collide on a union. */
export type Queryable = {
  readonly querySelectorAll: (selector: string) => Iterable<unknown>;
};

/** Every matching descendant, as the HTMLElements a script can drive. */
export const queryAll = (root: Queryable, selector: string): readonly HTMLElement[] =>
  Array.from(root.querySelectorAll(selector)).filter(isHtmlElement);
