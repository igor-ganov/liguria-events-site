/** Narrow an event target to an Element — the branch-free stand-in for
 *  `event.target instanceof Element ? event.target : undefined`. */
export const isElement = (node: unknown): node is Element => node instanceof Element;
