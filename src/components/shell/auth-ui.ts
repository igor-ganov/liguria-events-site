import { readUiIsland } from '../shared/read-ui-island.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** The sign-in copy, read once from the page's #ui-data island — exactly as the
 *  single inline script used to, so a mid-flow SPA swap cannot change it. */
export const AUTH_UI: Ui['auth'] = readUiIsland().ui.auth;
