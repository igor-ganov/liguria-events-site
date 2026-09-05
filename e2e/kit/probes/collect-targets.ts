/**
 * Every control a thumb is meant to hit, with its rendered size.
 *
 * Only interactive elements, so the list stays short. `inline` carries the
 * WCAG exemption for a target sitting in a line of text; what that exemption
 * means is decided outside, in tapTargetFaults.
 */
export const collectTargets = (): unknown[] => {
  const SELECTOR = 'a[href], button, input:not([type=hidden]), select, textarea, [role="button"], [tabindex]';
  const labelOf = (el: Element): string =>
    [el.tagName.toLowerCase(), ...[el.id].filter(Boolean).map((id) => `#${id}`),
      ...[el.classList[0]].filter(Boolean).map((name) => `.${name}`),
      ...[el.textContent?.trim()].filter(Boolean).map((text) => ` "${text.slice(0, 24)}"`)].join('');
  return [...document.querySelectorAll(SELECTOR)]
    .map((el) => ({ el, style: getComputedStyle(el), rect: el.getBoundingClientRect() }))
    .filter(({ style }) => style.visibility !== 'hidden' && style.display !== 'none')
    .map(({ el, style, rect }) => ({
      label: labelOf(el),
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      scrollable: false,
      inline: style.display === 'inline',
    }));
};
