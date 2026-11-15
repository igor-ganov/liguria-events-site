import { beginLoading } from './begin-loading.ts';
import { lastPress } from './last-press.ts';
import { PENDING_EVENT } from './pending-event.ts';
import { pressedTarget } from '../../lib/loading/pressed-target.ts';
import { PRESS_WINDOW_MS } from '../../lib/loading/press-window-ms.ts';

const settle = (event: Event): void => {
  const work: unknown = Reflect.get(Reflect.get(event, 'detail') ?? {}, 'work');
  const fallback: unknown = Reflect.get(Reflect.get(event, 'detail') ?? {}, 'fallback');
  const pressed = pressedTarget(PRESS_WINDOW_MS)(lastPress.current, performance.now());
  const fallen = [fallback].filter((node): node is Element => node instanceof Element).at(0);
  const end = beginLoading(pressed ?? fallen, pressed !== undefined);
  void Promise.resolve(work).finally(end);
};

/** Loads started by the page's own scripts (trackPending): the control just
 *  pressed shows it is busy until the load settles; with none pressed, the
 *  fallback is marked busy and nothing more. */
export const watchPending = (): void => {
  document.addEventListener(PENDING_EVENT, settle);
};
