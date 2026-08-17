import { escHtml } from './esc-html.ts';
import { when } from './when.ts';
import type { LegSegment } from '../../lib/favorites/build-route.ts';

// Compact multimodal breakdown: 🚶 4′ → 🚌 20 → De Ferrari 12′ → 🚶 3′.
const MODE_ICON: Readonly<Record<string, string>> = {
  walk: '🚶', bus: '🚌', metro: '🚇', train: '🚆', funicular: '🚡', boat: '⛴',
};

/** One part of a real routed leg: its mode icon, line, destination, minutes. */
export const segmentText = (s: LegSegment): string =>
  `<span class="route-leg-part">${MODE_ICON[s.mode] ?? '🚌'}` +
  when(Boolean(s.line), ` ${escHtml(s.line ?? '')}`) +
  when(s.mode !== 'walk' && Boolean(s.to), ` → ${escHtml(s.to ?? '')}`) +
  ` ${s.minutes}′</span>`;
