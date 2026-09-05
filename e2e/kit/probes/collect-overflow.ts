/**
 * Elements reaching outside the viewport sideways, as plain numbers.
 *
 * The page-side filter is deliberately generous — anything past either edge at
 * all — and the tolerance, the scroller rule and the verdict live outside, in
 * overflowFaults. What comes back is a handful of objects rather than every
 * element on the page, which is what keeps this cheap enough to run on every
 * page in every form factor.
 *
 * Self-contained on purpose: page.evaluate serialises the function, so it can
 * reference nothing from this module.
 */
export const collectOverflow = (): { viewport: number; boxes: unknown[] } => {
  const viewport = document.documentElement.clientWidth;
  const labelOf = (el: Element): string =>
    [el.tagName.toLowerCase(), ...[el.id].filter(Boolean).map((id) => `#${id}`),
      ...[el.classList[0]].filter(Boolean).map((name) => `.${name}`)].join('');
  const ancestors = (el: Element): Element[] => {
    const chain: Element[] = [];
    for (let node = el.parentElement; node; node = node.parentElement) chain.push(node);
    return chain;
  };
  // Contained: an ancestor that scrolls sideways on purpose, or one that
  // clips. A map marker sitting past the right edge of a map with
  // overflow:hidden cannot make the page scroll, and reporting it as if it
  // could is a false alarm that trains people to ignore the real ones.
  const contained = (el: Element): boolean =>
    ancestors(el).some((node) => {
      const overflow = getComputedStyle(node).overflowX;
      const clips = ['hidden', 'clip'].includes(overflow);
      const scrolls = ['auto', 'scroll'].includes(overflow) && node.scrollWidth > node.clientWidth;
      return clips || scrolls;
    });
  const boxes = [...document.querySelectorAll('body *')]
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 0 && rect.height > 0)
    .filter(({ rect }) => rect.right > viewport || rect.left < 0)
    .slice(0, 40)
    .map(({ el, rect }) => ({
      label: labelOf(el),
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      scrollable: contained(el),
      inline: getComputedStyle(el).display === 'inline',
    }));
  return { viewport, boxes };
};
