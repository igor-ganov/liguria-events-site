import { queryAll } from '../../lib/dom/query-all.ts';

const show = (frame: HTMLIFrameElement): void => {
  frame.src = frame.dataset['src'] ?? '';
  frame.removeAttribute('data-src');
};

/**
 * Give each embedded map its address when the reader reaches it. The frame is
 * somebody else's application — half a megabyte of script — and the browser's
 * own lazy loading starts it well before it is on screen, which on a short
 * page is at once: it then competes with the page itself for the connection.
 * A frame that is never reached is never fetched.
 */
export const wireMapFrames = (): void => {
  const watcher = new IntersectionObserver((entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target)
      .filter((target): target is HTMLIFrameElement => target instanceof HTMLIFrameElement)
      .forEach((frame) => {
        watcher.unobserve(frame);
        show(frame);
      });
  });
  queryAll(document, '.event-map iframe[data-src]').forEach((frame) => watcher.observe(frame));
};
