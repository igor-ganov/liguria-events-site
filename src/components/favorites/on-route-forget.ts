import { forgetLocalRoute } from './forget-local-route.ts';
import { refreshMyRoutes } from './refresh-my-routes.ts';

/** Shell: forget a route — always locally, and on the server when it is owned. */
export const onRouteForget = (button: HTMLElement): void => {
  const id = button.dataset['id'] ?? '';
  forgetLocalRoute(id);
  [id]
    .filter(() => button.dataset['owned'] === '1')
    .forEach((owned) => {
      void fetch(`/api/routes/${owned}`, { method: 'DELETE' });
    });
  void refreshMyRoutes();
};
