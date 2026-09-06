import { flushOutbox } from './flush-outbox.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { outboxEntries } from '../../lib/outbox/outbox-entries.ts';
import { outboxNotice } from '../../lib/outbox/outbox-notice.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';

const show = async (bar: HTMLElement): Promise<void> => {
  const notice = outboxNotice(readUiIsland().ui.outbox, await outboxEntries().catch(() => []));
  bar.textContent = notice;
  bar.hidden = notice === '';
};

const attempt = async (bar: HTMLElement): Promise<void> => {
  await flushOutbox();
  await show(bar);
};

/**
 * Send whatever is waiting, and say what is left.
 *
 * On every page, not only on the form: an author who wrote an event on a train
 * and then closed the tab has to be told it went out — or that it did not —
 * wherever they next open the site. The `online` event is the usual trigger;
 * the load is for the case where the device was offline the whole time the tab
 * was closed and comes back with it shut.
 */
export const initOutbox = (): void => {
  [document.querySelector<HTMLElement>('[data-outbox-notice]') ?? undefined]
    .filter(isDefined)
    .forEach((bar) => {
      void attempt(bar);
      addEventListener('online', () => void attempt(bar));
    });
};
