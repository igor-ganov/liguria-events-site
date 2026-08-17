import { Schema } from 'effect';
import { LOCALES } from './locales.ts';
import { UiDictSchema } from './ui-dict-schema.ts';

/** UI dict as embedded in the page's #ui-data island; mirrors the content
 *  collection schema. Decoded on the client with English fallback. The dict
 *  itself lives in ui-dict-schema.ts, section by section. */
export const PageDataSchema = Schema.Struct({
  lang: Schema.Literal(...LOCALES),
  ui: UiDictSchema,
});

export type PageData = Schema.Schema.Type<typeof PageDataSchema>;
export type Ui = PageData['ui'];
