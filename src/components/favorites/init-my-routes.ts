// The "My routes" list on the favourites page. Registered users get their
// server-stored routes (with a privacy toggle + delete); everyone keeps a
// localStorage copy of the links they created (open + forget), so an anonymous
// visitor still finds the shareable links they generated on this device.
import { onMyRoutesClick } from './on-my-routes-click.ts';
import { refreshMyRoutes } from './refresh-my-routes.ts';

const wiring = { done: false };

/** Shell: paint the list and, once per page load, wire the delegated clicks. */
export const initMyRoutes = (): void => {
  void refreshMyRoutes();
  [wiring]
    .filter((state) => !state.done)
    .forEach((state) => {
      state.done = true;
      document.addEventListener('click', onMyRoutesClick);
    });
};
