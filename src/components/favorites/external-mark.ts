import { hiddenText } from './hidden-text.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';

/** The mark after the text of a link that opens another site in a new tab: the
 *  external icon, and the words it stands for for a screen reader. */
export const externalMark = (label: string): string => `${uiIcon('external', '1em')}${hiddenText(` ${label}`)}`;
