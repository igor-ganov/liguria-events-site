import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { UiIconName } from '../../lib/icons/ui-icon-paths.ts';

/** Lit face of uiIcon (safe: the markup is our own constant), sized to the
 *  surrounding text by default. */
export const renderUiIcon = (name: UiIconName, size: number | '1em' = '1em') => unsafeHTML(uiIcon(name, size));
