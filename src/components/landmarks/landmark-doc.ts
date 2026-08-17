import type { SearchDoc } from '../../lib/search/index.ts';
import type { Landmark } from '../../lib/landmarks/landmark-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** What the fuzzy scorer sees: the name carries the title weight, the kind
 *  label stands in for a description, the Wikipedia summary is the body. */
export const landmarkDoc =
  (lang: Locale, ui: Ui) =>
  (landmark: Landmark): SearchDoc => ({
    id: landmark.id,
    lang,
    section: 'page',
    url: landmark.wiki ?? landmark.wd ?? '',
    title: landmark.name,
    description: ui.landmarks.kinds[landmark.kind] ?? landmark.kind,
    body: landmark.desc ?? '',
  });
