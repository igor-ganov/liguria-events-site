import { branch } from '../../lib/branch.ts';
import { notifyToggle } from './notify-toggle.ts';
import { pushState } from './push-state.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';

const text = (node: Element | null, value: string): void => {
  [node].filter((found): found is HTMLElement => found instanceof HTMLElement).forEach((found) => {
    found.textContent = value;
    found.hidden = value === '';
  });
};

/**
 * The switch on the notification card.
 *
 * Its state is asked of the browser on load rather than remembered: permission
 * can be revoked in the system settings, and a switch that says "on" over a
 * revoked permission is a lie the reader cannot fix.
 */
export const initNotify = (): void => {
  const { ui } = readUiIsland();
  [document.querySelector('[data-notify]')]
    .filter((node): node is HTMLElement => node instanceof HTMLElement)
    .forEach((card) => {
      const toggle = card.querySelector('[data-notify-toggle]');
      const draw = (on: boolean): void => {
        toggle?.setAttribute('aria-pressed', String(on));
        text(toggle, branch(on)(() => ui.notify.off, () => ui.notify.on));
      };
      const parts = {
        card,
        ui,
        say: (value: string) => text(card.querySelector('[data-notify-status]'), value),
        told: (place: string) =>
          text(
            card.querySelector('[data-notify-where]'),
            branch(place === '')(() => '', () => ui.notify.where.replace('{value}', place.replace(/^\w+:/, ''))),
          ),
        hour: () =>
          [...card.querySelectorAll<HTMLInputElement>('[data-notify-hour]')]
            .filter((node) => node.checked)
            .map((node) => Number(node.value))
            .at(0) ?? 9,
      };
      void pushState().then(draw);
      toggle?.addEventListener('click', () => {
        void notifyToggle(parts, toggle.getAttribute('aria-pressed') === 'true').then(draw);
      });
    });
};
