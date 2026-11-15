import { flatOptions } from './flat-options.ts';
import type { SuggestGroups } from '../../lib/suggest/suggest-doc.ts';
import type { SuggestHost } from './suggest-host.ts';

/** Put a new answer on screen. The option the reader had arrowed to stays
 *  active if it is still there — the meaning's answer arrives after the
 *  letters', and must not throw away where the keyboard was. */
export const showGroups = (host: SuggestHost, groups: SuggestGroups): void => {
  const was = flatOptions(host.groups)[host.active]?.id;
  host.active = flatOptions(groups).findIndex((doc) => doc.id === was);
  host.groups = groups;
  host.open = flatOptions(groups).length > 0;
};
