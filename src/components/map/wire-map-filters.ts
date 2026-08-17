import { branch } from '../../lib/branch.ts';
import { isCategory } from '../../lib/events/is-category.ts';
import { mapState } from './map-state.ts';
import { onClick } from '../../lib/dom/on-click.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { queryInput } from '../../lib/dom/query-input.ts';

const toggleCategory = (chip: HTMLElement): void => {
  [chip.dataset['mapCat']].filter(isCategory).forEach((cat) =>
    branch(mapState.selected.has(cat))(
      () => {
        mapState.selected.delete(cat);
      },
      () => {
        mapState.selected.add(cat);
      },
    ),
  );
};

/** The event filter toolbar: category chips, the free and hidden-gem chips, the
 *  two date bounds and the clear chip. Each of them only edits the shared state
 *  and asks for a refresh — the map redraws from the state, never from an event. */
export const wireMapFilters = (refresh: () => void): void => {
  queryAll(document, '[data-map-cat]').forEach((chip) =>
    chip.addEventListener('click', () => {
      toggleCategory(chip);
      refresh();
    }),
  );
  onClick('[data-map-free]', () => {
    mapState.freeOnly = !mapState.freeOnly;
    refresh();
  });
  onClick('[data-map-gems]', () => {
    mapState.gemsOnly = !mapState.gemsOnly;
    refresh();
  });
  queryInput('[data-map-from]').forEach((el) =>
    el.addEventListener('change', () => {
      mapState.from = el.value;
      refresh();
    }),
  );
  queryInput('[data-map-to]').forEach((el) =>
    el.addEventListener('change', () => {
      mapState.to = el.value;
      refresh();
    }),
  );
  onClick('[data-map-clear]', () => {
    mapState.selected.clear();
    mapState.freeOnly = false;
    mapState.gemsOnly = false;
    refresh();
  });
};
