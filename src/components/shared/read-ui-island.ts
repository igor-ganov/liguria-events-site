import { Either, Schema } from 'effect';
import { PageDataSchema } from '../../lib/i18n/ui-schema.ts';
import type { PageData } from '../../lib/i18n/ui-schema.ts';
import { DEFAULT_PAGE_DATA } from './default-page-data.ts';

const decode = Schema.decodeUnknownEither(PageDataSchema);

const parseJson = (text: string): unknown => {
  try {
    const value: unknown = JSON.parse(text);
    return value;
  } catch {
    return undefined;
  }
};

/** Shell: read the page's embedded {lang, ui} island; malformed → EN default. */
export const readUiIsland = (): PageData =>
  Either.getOrElse(
    decode(parseJson(document.getElementById('ui-data')?.textContent ?? '')),
    () => DEFAULT_PAGE_DATA,
  );
