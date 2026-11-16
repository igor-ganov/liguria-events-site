import { hiddenText } from './hidden-text.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { UiIconName } from '../../lib/icons/ui-icon-paths.ts';
import type { Ui } from './render-types.ts';

type Named = Readonly<{ icon: UiIconName; label: (route: Ui['route']) => string }>;

// Every way a routed leg can be travelled, and a bus for any the router
// reports that is not listed here.
const MODES: Readonly<Record<string, Named>> = {
  walk: { icon: 'walk', label: (r) => r.walk },
  bus: { icon: 'bus', label: (r) => r.bus },
  metro: { icon: 'metro', label: (r) => r.metro },
  train: { icon: 'train', label: (r) => r.train },
  funicular: { icon: 'funicular', label: (r) => r.funicular },
  boat: { icon: 'ferry', label: (r) => r.boat },
};
const FALLBACK: Named = { icon: 'bus', label: (r) => r.transit };

/** A travel mode drawn as its icon, named for a screen reader. */
export const modeGlyph = (mode: string, ui: Ui): string => {
  const named = MODES[mode] ?? FALLBACK;
  return `${uiIcon(named.icon, '1em')}${hiddenText(named.label(ui.route))}`;
};
