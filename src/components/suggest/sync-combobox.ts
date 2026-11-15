import { branch } from '../../lib/branch.ts';
import { flatOptions } from './flat-options.ts';
import { SUGGEST_IDS } from './suggest-ids.ts';
import type { SuggestHost } from './suggest-host.ts';

/** Keep the text field's ARIA in step with the popup after every render:
 *  it is the combobox, it controls the list, it says whether the list is open
 *  and which option is active — focus itself never leaves the field. */
export const syncCombobox = (host: SuggestHost, input: HTMLInputElement): void => {
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', SUGGEST_IDS.list);
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-expanded', String(host.open));
  const active = host.open && flatOptions(host.groups)[host.active] !== undefined;
  branch(active)(
    () => {
      input.setAttribute('aria-activedescendant', SUGGEST_IDS.option(host.active));
      host.querySelector(`#${SUGGEST_IDS.option(host.active)}`)?.scrollIntoView({ block: 'nearest' });
    },
    () => input.removeAttribute('aria-activedescendant'),
  );
};
