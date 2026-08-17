import type { Corner } from './corner.ts';

/** Viewport size the button is parked against. */
export type Viewport = Readonly<{ width: number; height: number }>;

/** Top-left pixel position of the button parked in a given corner. */
export const fabXY = (
  corner: Corner,
  size: number,
  margin: number,
  view: Viewport,
): Readonly<{ x: number; y: number }> => {
  const right = view.width - size - margin;
  const bottom = view.height - size - margin;
  return {
    'top-left': { x: margin, y: margin },
    'top-right': { x: right, y: margin },
    'bottom-left': { x: margin, y: bottom },
    'bottom-right': { x: right, y: bottom },
  }[corner];
};
