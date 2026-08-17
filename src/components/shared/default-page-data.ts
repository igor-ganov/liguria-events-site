import { DEFAULT_UI } from '../../lib/i18n/defaults/default-ui.ts';
import type { PageData } from '../../lib/i18n/ui-schema.ts';

/** English safety net if the #ui-data island is missing/malformed (never
 *  expected — the island is always embedded). */
export const DEFAULT_PAGE_DATA: PageData = { lang: 'en', ui: DEFAULT_UI };
