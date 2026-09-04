import { isDefined } from '../../lib/is-defined.ts';
import type { InstallEvent } from './install-event.ts';

const show = (button: HTMLElement, event: InstallEvent): void => {
  button.hidden = false;
  button.addEventListener('click', () => {
    button.hidden = true;
    void event.prompt();
  });
};

/**
 * The browser decides whether the site may be installed, and says so once, by
 * firing this event — there is no way to ask. So the button does not exist
 * until the answer is yes: no dead control on iOS, none in a browser that has
 * already installed the app, and none inside the installed app itself.
 *
 * preventDefault stops Chrome's own mini-infobar, so the offer appears where
 * the page decided to put it rather than over the content.
 */
export const initInstallPrompt = (): void => {
  addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    [document.querySelector<HTMLElement>('[data-install-app]') ?? undefined]
      .filter(isDefined)
      .forEach((button) => show(button, event));
  });
};
