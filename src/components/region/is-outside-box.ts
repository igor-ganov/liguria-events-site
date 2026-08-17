/** The part of a DOMRect a hit test needs. */
export type Box = {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
};

/** Whether a point missed the box. A modal dialog fills the sheet's box only, so
 *  a tap on the backdrop lands on the dialog itself — outside its content. */
export const isOutsideBox = (box: Box, x: number, y: number): boolean =>
  x < box.left || x > box.right || y < box.top || y > box.bottom;
