import type { ThreadLabels } from './thread-labels.ts';
import type { Ui } from '../../i18n/ui-schema.ts';

/** The thread's words, picked out of the page's dictionary. */
export const threadLabelsOf = (ui: Ui): ThreadLabels => ({
  today: ui.eventPage.today,
  oneDate: ui.eventPage.oneDate,
  datesCount: ui.eventPage.datesCount,
  left: ui.eventPage.left,
  more: ui.eventPage.more,
  free: ui.eventPage.freeEntry,
  from: ui.eventPage.price,
  priceUnknown: ui.eventPage.priceUnknown,
});
