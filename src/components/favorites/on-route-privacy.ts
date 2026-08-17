import { refreshMyRoutes } from './refresh-my-routes.ts';

/** Shell: flip a route between public and private, then repaint the row. */
export const onRoutePrivacy = (button: HTMLElement): void => {
  const id = button.dataset['id'] ?? '';
  const makePublic = button.dataset['public'] !== '1'; // currently private → make public
  void fetch(`/api/routes/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ public: makePublic }),
  }).then(() => refreshMyRoutes());
};
