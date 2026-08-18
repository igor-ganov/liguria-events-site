import { keyboardInset } from '../../lib/dom/keyboard-inset.ts';

// The visual viewport is missing on older browsers; there the keyboard simply
// keeps its old behaviour rather than the page throwing on load.
const isViewport = (value: unknown): value is VisualViewport => value instanceof VisualViewport;
const viewports = (): readonly VisualViewport[] => [window.visualViewport].filter(isViewport);

const publish = (viewport: VisualViewport): void => {
  const inset = keyboardInset({
    layoutHeight: window.innerHeight,
    visualHeight: viewport.height,
    offsetTop: viewport.offsetTop,
  });
  document.documentElement.style.setProperty('--kb-inset', `${inset}px`);
  document.documentElement.style.setProperty('--vv-height', `${Math.round(viewport.height)}px`);
};

/**
 * Mirror the on-screen keyboard's height into `--kb-inset` (and the visible
 * height into `--vv-height`), so a bottom sheet can sit ABOVE the keyboard
 * instead of behind it. Wired once per page; the values are plain CSS custom
 * properties, so any sheet can opt in from its own stylesheet.
 */
export const trackKeyboardInset = (): void =>
  viewports().forEach((viewport) => {
    publish(viewport);
    viewport.addEventListener('resize', () => publish(viewport));
    viewport.addEventListener('scroll', () => publish(viewport));
  });
