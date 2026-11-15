import { suggestController } from './suggest-controller.ts';
import { suggestKeydown } from './suggest-keydown.ts';
import type { SuggestHost } from './suggest-host.ts';

/**
 * Attach the combobox to the search field already on the page. The field
 * keeps filtering the feed as before; this only adds the popup. If the reader
 * typed before the component arrived (it is loaded on first touch), what is
 * in the box is answered at once. Returns the undo, for when the element
 * leaves the page on a client-side navigation.
 */
export const wireSuggest = (host: SuggestHost, input: HTMLInputElement, region: string, today: string): (() => void) => {
  const control = suggestController(host, input, { region, today });
  const close = (): void => {
    host.open = false;
    host.active = -1;
  };
  const keydown = suggestKeydown(host);
  input.addEventListener('input', control.typed);
  input.addEventListener('focus', control.warm);
  input.addEventListener('keydown', keydown);
  input.addEventListener('blur', close);
  control.warm();
  [input.value.trim()].filter((typed) => typed !== '' && document.activeElement === input).forEach(control.typed);
  return () => {
    input.removeEventListener('input', control.typed);
    input.removeEventListener('focus', control.warm);
    input.removeEventListener('keydown', keydown);
    input.removeEventListener('blur', close);
  };
};
