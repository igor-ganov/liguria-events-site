import { queueSubmission } from './queue-submission.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { setText } from '../../lib/dom/set-text.ts';
import type { SubmitTarget } from './event-submit-target.ts';

/**
 * The send never reached the site. Keep the author's work and say so.
 *
 * The wording matters more than the mechanism: "saved on this device, it will
 * be published when you are back online" is a promise, and it is the one thing
 * that must not be said unless the queue really has it. So the message comes
 * after the write, not before.
 */
export const keepForLater = async (
  target: SubmitTarget,
  values: Record<string, unknown>,
  status: HTMLElement | undefined,
): Promise<void> => {
  const title = String(values['title'] ?? '');
  await queueSubmission(target, values, title);
  setText(status, readUiIsland().ui.outbox.queued);
};
