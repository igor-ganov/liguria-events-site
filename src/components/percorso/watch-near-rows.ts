import { branch } from '../../lib/branch.ts';
import { isHtmlElement } from '../../lib/dom/is-html-element.ts';
import { queryAll } from '../../lib/dom/query-all.ts';

/** How far past the screen a row still counts as worth drawing a stop for. */
const BAND = '120% 0px 120% 0px';

type Handlers = Readonly<{
  enter: (row: HTMLElement) => void;
  leave: (row: HTMLElement) => void;
}>;

/**
 * Reports rows as they come near the screen and as they go away again. A feed
 * carries hundreds of them: hanging a stop on every one, and measuring every
 * one on every frame, is what made the thread stutter.
 */
export const watchNearRows = (column: HTMLElement, { enter, leave }: Handlers): void => {
  const report = (entry: IntersectionObserverEntry): void =>
    [entry.target].filter(isHtmlElement).forEach((row) =>
      branch(entry.isIntersecting)(
        () => enter(row),
        () => leave(row),
      ),
    );
  const eye = new IntersectionObserver((entries) => entries.forEach(report), { rootMargin: BAND });
  queryAll(column, '.fermata').forEach((row) => eye.observe(row));
};
