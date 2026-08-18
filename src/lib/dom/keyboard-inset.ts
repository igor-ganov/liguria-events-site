/** What the browser reports about the two viewports: the layout one the page is
 *  laid out in, and the visual one actually on screen. */
export type ViewportMetrics = Readonly<{
  layoutHeight: number;
  visualHeight: number;
  offsetTop: number;
}>;

/**
 * How many pixels at the bottom of the LAYOUT viewport are covered — by the
 * on-screen keyboard, in practice.
 *
 * `position: fixed; bottom: 0` anchors to the layout viewport, which the
 * keyboard does not shrink, so a bottom sheet slides underneath it and the list
 * becomes unreachable. Lifting the sheet by this many pixels puts it back on
 * screen. Rounded, because sub-pixel jitter on every scroll frame would
 * otherwise thrash the layout.
 */
export const keyboardInset = (metrics: ViewportMetrics): number =>
  Math.max(0, Math.round(metrics.layoutHeight - metrics.visualHeight - metrics.offsetTop));
