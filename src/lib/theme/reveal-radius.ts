/** How far the circular theme reveal must grow from the tap: to the farthest
 *  viewport corner, so the incoming scheme covers the whole page. */
export const revealRadius = (x: number, y: number, width: number, height: number): number =>
  Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
