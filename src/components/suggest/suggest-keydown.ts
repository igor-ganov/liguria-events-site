import { flatOptions } from './flat-options.ts';
import { moveActive } from '../../lib/suggest/move-active.ts';
import { openSuggestion } from './open-suggestion.ts';
import type { SuggestDoc } from '../../lib/suggest/suggest-doc.ts';
import type { SuggestHost } from './suggest-host.ts';

const close = (host: SuggestHost): void => {
  host.open = false;
  host.active = -1;
};

/**
 * The combobox keys (WAI-ARIA APG, combobox with listbox popup): the arrows
 * walk every option of both groups and open the popup if it was closed;
 * Enter opens the active option; Escape closes the popup and keeps the text —
 * the browser would otherwise clear a search field on Escape. With nothing
 * active, Enter is left to the feed's own filtering, as before.
 */
export const suggestKeydown = (host: SuggestHost) => (event: KeyboardEvent): void => {
  const options = flatOptions(host.groups);
  const move = (): void => {
    event.preventDefault();
    host.open = options.length > 0;
    host.active = moveActive(options.length, host.active, event.key);
  };
  const KEYS: Readonly<Record<string, () => void>> = {
    ArrowDown: move,
    ArrowUp: move,
    Enter: () =>
      [options[host.active]]
        .filter((doc): doc is SuggestDoc => host.open && doc !== undefined)
        .forEach((doc) => {
          event.preventDefault();
          openSuggestion(host.locale)(doc);
        }),
    Escape: () =>
      [host.open].filter(Boolean).forEach(() => {
        event.preventDefault();
        close(host);
      }),
    Tab: () => close(host),
  };
  (KEYS[event.key] ?? (() => undefined))();
};
