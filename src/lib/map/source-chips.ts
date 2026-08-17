import { branch } from '../branch.ts';
import { escapeAttr } from './escape-attr.ts';

/** One attributed source behind an event: where the listing was crawled from. */
export type PopupSource = Readonly<{ name: string; url: string }>;

/**
 * The "seen on" chips of a map popup — one outbound link per source, or an
 * empty string when the item carries none (so the popup renders no empty row).
 */
export const sourceChips = (sources: readonly PopupSource[]): string =>
  branch(sources.length === 0)(
    () => '',
    () =>
      `<span class="map-pop-src">${sources
        .map(
          (source) =>
            `<a href="${escapeAttr(source.url)}" target="_blank" rel="noopener">${escapeAttr(source.name)}</a>`,
        )
        .join('')}</span>`,
  );
