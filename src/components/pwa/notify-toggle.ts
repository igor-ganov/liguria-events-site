import { branch } from '../../lib/branch.ts';
import { pushPlace } from './push-place.ts';
import { pushSubscribe } from './push-subscribe.ts';
import { pushUnsubscribe } from './push-unsubscribe.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

export type NotifyParts = Readonly<{
  card: HTMLElement;
  say: (text: string) => void;
  told: (place: string) => void;
  hour: () => number;
  ui: Ui;
}>;

/**
 * What one tap does.
 *
 * On: ask the browser, subscribe, tell the sender where and when — and report
 * a refusal rather than leaving a switch that claims to be on. Off: unsubscribe
 * on both sides, because either half alone leaves a device that is woken and
 * shows nothing, or a send that fails every morning.
 */
export const notifyToggle = async (parts: NotifyParts, wasOn: boolean): Promise<boolean> =>
  branch(wasOn)(
    async () => {
      await pushUnsubscribe();
      parts.say('');
      return false;
    },
    async () => {
      parts.say(parts.ui.notify.asked);
      const place = await pushPlace(parts.card.dataset['place'] ?? '');
      const ok = await pushSubscribe(
        parts.card.dataset['vapid'] ?? '',
        place,
        parts.card.dataset['lang'] ?? 'en',
        parts.hour(),
      );
      parts.say(branch(ok)(() => parts.ui.notify.done, () => parts.ui.notify.refused));
      parts.told(branch(ok)(() => place, () => ''));
      return ok;
    },
  );
