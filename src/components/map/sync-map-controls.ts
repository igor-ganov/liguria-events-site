import { isCategory } from '../../lib/events/is-category.ts';
import { mapState } from './map-state.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { queryInput } from '../../lib/dom/query-input.ts';
import { setHidden } from '../../lib/dom/set-hidden.ts';
import { setPressed } from '../../lib/dom/set-pressed.ts';

/** Any filter at all is what the clear chip exists for. */
const anyFilter = (): boolean =>
  mapState.selected.size > 0 || mapState.freeOnly || mapState.gemsOnly;

/** Redraw the event filter controls from the state: which category chips are
 *  pressed, the two date bounds and their allowed range, and whether the clear
 *  chip has anything to clear. */
export const syncMapControls = (maxDate: string): void => {
  queryAll(document, '[data-map-cat]').forEach((chip) =>
    setPressed(
      chip,
      [chip.dataset['mapCat']].filter(isCategory).some((cat) => mapState.selected.has(cat)),
    ),
  );
  setPressed(document.querySelector('[data-map-free]') ?? undefined, mapState.freeOnly);
  setPressed(document.querySelector('[data-map-gems]') ?? undefined, mapState.gemsOnly);
  const range = { min: mapState.today, max: maxDate };
  queryInput('[data-map-from]').forEach((el) => Object.assign(el, { value: mapState.from, ...range }));
  queryInput('[data-map-to]').forEach((el) => Object.assign(el, { value: mapState.to, ...range }));
  setHidden(document.querySelector<HTMLElement>('[data-map-clear]') ?? undefined, !anyFilter());
};
