import { commonsImg } from '../../lib/img/commons-img.ts';
import { landmarkColor } from '../../lib/landmarks/landmark-color.ts';
import { landmarkIcon } from '../../lib/landmarks/landmark-icon.ts';
import { landmarkPath } from '../../lib/landmarks/landmark-path.ts';
import { landmarkSources } from '../../lib/landmarks/landmark-sources.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import type { LandmarkPopup } from '../../lib/map/landmark-popup-html.ts';
import type { Landmark } from '../../lib/landmarks/landmark-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** Photo width a landmark card asks Commons for. */
const CARD_PX = 240;

/** The card a landmark marker opens, with routing, colours and labels already
 *  resolved — the markup builder stays free of i18n and paths. Photos go
 *  through Special:FilePath at the wanted width (https, any size on demand). */
export const landmarkCard =
  (lang: Locale, ui: Ui) =>
  (landmark: Landmark): LandmarkPopup => ({
    href: localizedUrl(lang, landmarkPath(landmark.region, landmark.name, landmark.id)),
    image: landmark.img && commonsImg(landmark.img, CARD_PX),
    kindColor: landmarkColor(landmark.kind),
    kindIcon: landmarkIcon(landmark.kind, 13),
    kindLabel: ui.landmarks.kinds[landmark.kind] ?? landmark.kind,
    title: landmark.name,
    desc: landmark.desc,
    sources: landmarkSources(landmark),
  });
