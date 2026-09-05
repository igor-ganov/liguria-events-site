/**
 * One rendered element, as a probe can carry it out of the page: numbers and
 * two flags, nothing that only means something inside a browser.
 *
 * `scrollable` says an ancestor scrolls horizontally on purpose — wide content
 * in its own scroller is the right answer to wide content, not a fault.
 * `inline` says the element sits in a line of text, which WCAG exempts from
 * the target-size rule.
 */
export type Box = Readonly<{
  label: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  scrollable: boolean;
  inline: boolean;
}>;
