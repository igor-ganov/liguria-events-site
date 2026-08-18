import { queryAll } from '../../lib/dom/query-all.ts';

/**
 * Hand the toolbar over to the user.
 *
 * The map engine arrives behind a dynamic import, so between first paint and
 * `wireMapFlows` the chips and the date bounds are rendered but connected to
 * nothing — a click on "Landmarks" in that window used to be swallowed without a
 * trace. They ship `disabled` and are armed here, once every handler is on.
 */
export const armMapControls = (): void =>
  queryAll(document, '[data-map-filters]').forEach((toolbar) => {
    queryAll(toolbar, '[disabled]').forEach((control) => control.removeAttribute('disabled'));
    toolbar.dataset['armed'] = 'true';
  });
