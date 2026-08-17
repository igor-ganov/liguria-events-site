/** Narrow an event target to a <select>. */
export const isSelectElement = (node: unknown): node is HTMLSelectElement =>
  node instanceof HTMLSelectElement;
