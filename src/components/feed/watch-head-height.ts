import { queryAll } from '../../lib/dom/query-all.ts';

const held: { observer?: ResizeObserver } = {};

/** Tell the stylesheet how tall the site header is (`--site-head-h`), so a
 *  day's heading sticks right under it whatever the header wraps into. */
export const watchHeadHeight = (): void => {
  held.observer?.disconnect();
  held.observer = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const height = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
      document.documentElement.style.setProperty('--site-head-h', `${height}px`);
    });
  });
  queryAll(document, '.site-head').forEach((head) => held.observer?.observe(head));
};
