/** Narrow an unknown node to an HTMLElement. Going through `unknown` keeps the
 *  guard working where @cloudflare/workers-types shadows the DOM Element and
 *  the querySelector generics stop lining up. */
export const isHtmlElement = (node: unknown): node is HTMLElement => node instanceof HTMLElement;
