/** Narrow an event target to an Element. Going through `unknown` keeps the
 *  guard working where @cloudflare/workers-types shadows the DOM Element. */
export const isElement = (node: unknown): node is Element => node instanceof Element;
