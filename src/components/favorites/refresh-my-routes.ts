import { fetchServerRoutes } from './fetch-server-routes.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { localRouteRows } from './local-route-rows.ts';
import { mergeRouteRows } from './merge-route-rows.ts';
import { renderMyRoutes } from './render-my-routes.ts';

const paint = async (list: HTMLElement, section: HTMLElement): Promise<void> => {
  renderMyRoutes(mergeRouteRows(await fetchServerRoutes(), localRouteRows()), list, section);
};

/** Shell: reload both sources and repaint — a no-op on a page without the list. */
export const refreshMyRoutes = async (): Promise<void> => {
  const section = document.querySelector<HTMLElement>('[data-route-mine]') ?? undefined;
  await Promise.all(
    [document.querySelector<HTMLElement>('[data-route-mine-list]') ?? undefined]
      .filter(isDefined)
      .flatMap((list) => [section].filter(isDefined).map((node) => paint(list, node))),
  );
};
