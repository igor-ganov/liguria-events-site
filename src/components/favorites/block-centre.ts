/** A block's vertical centre on its axis, in pixels. */
export const blockCentre = (block: HTMLElement): number =>
  (Number.parseFloat(block.style.top) || 0) + block.offsetHeight / 2;
