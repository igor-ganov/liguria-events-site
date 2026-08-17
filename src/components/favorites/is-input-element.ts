/** Narrow an event target to an <input>. Going through `unknown` keeps the
 *  guard working where @cloudflare/workers-types shadows the DOM globals. */
export const isInputElement = (node: unknown): node is HTMLInputElement =>
  node instanceof HTMLInputElement;
