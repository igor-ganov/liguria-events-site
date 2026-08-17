import { branch } from '../../lib/branch.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { landmarkColor } from '../../lib/landmarks/landmark-color.ts';
import { landmarkIcon } from '../../lib/landmarks/landmark-icon.ts';
import { landmarkPath } from '../../lib/landmarks/landmark-path.ts';
import { landmarkThumbHtml } from './landmark-thumb-html.ts';
import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import type { Landmark } from '../../lib/landmarks/landmark-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

const descHtml = (landmark: Landmark): string =>
  branch((landmark.desc ?? '') === '')(
    () => '',
    () => `<p class="lm-desc">${escapeMarkup(landmark.desc ?? '')}</p>`,
  );

// The card links to the landmark's own detail page (not straight to Wikipedia —
// that lives under Sources there), same as an event mini-card links to its page.
export const landmarkCardHtml =
  (lang: Locale, ui: Ui) =>
  (landmark: Landmark): string => {
    const href = localizedUrl(lang, landmarkPath(landmark.region, landmark.name, landmark.id));
    const kindLabel = ui.landmarks.kinds[landmark.kind] ?? landmark.kind;
    return (
      `<a class="lm-card" href="${escapeMarkup(href)}" style="--lm:${landmarkColor(landmark.kind)}">` +
      `<span class="lm-thumb">${landmarkThumbHtml(landmark)}</span>` +
      `<span class="lm-info"><span class="lm-name">${escapeMarkup(landmark.name)}</span>` +
      `<span class="lm-kind">${landmarkIcon(landmark.kind, 15)} ${escapeMarkup(kindLabel)}</span>` +
      `${descHtml(landmark)}</span></a>`
    );
  };
