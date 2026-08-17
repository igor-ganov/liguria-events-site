/** Shell: the id of the route this page shows, stamped on its root element. */
export const routeId = (): string =>
  document.querySelector<HTMLElement>('[data-route-root]')?.dataset['id'] ?? '';
