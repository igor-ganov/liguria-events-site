import { escHtml } from './esc-html.ts';
import { modeGlyph } from './mode-glyph.ts';
import { when } from './when.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { LegSegment } from '../../lib/favorites/build-route.ts';
import type { Ui } from './render-types.ts';

// Compact multimodal breakdown: [walk] 4′ → [bus] 20 → De Ferrari 12′ → [walk] 3′,
// every mode and arrow drawn as an icon.
const TOWARDS = ` ${uiIcon('arrowRight', '1em')} `;

/** One part of a real routed leg: its mode icon, line, destination, minutes. */
export const segmentText =
  (ui: Ui) =>
  (s: LegSegment): string =>
    `<span class="route-leg-part">${modeGlyph(s.mode, ui)}` +
    when(Boolean(s.line), ` ${escHtml(s.line ?? '')}`) +
    when(s.mode !== 'walk' && Boolean(s.to), `${TOWARDS}${escHtml(s.to ?? '')}`) +
    ` ${s.minutes}′</span>`;
