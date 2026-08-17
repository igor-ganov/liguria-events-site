import { branch } from '../branch.ts';
import { clipText } from './clip-text.ts';
import { escapeAttr } from './escape-attr.ts';

// Opening hours arrive as a raw OSM string, which can run to several rules;
// the card shows the head of it and the detail page has the whole schedule.
const HOURS_LIMIT = 64;

/** The compact facts under a place card: opening hours (OSM) and phone. */
export type PlaceFacts = Readonly<{
  hours: string | undefined;
  hoursLabel: string;
  hoursIcon: string;
  phone: string | undefined;
  phoneLabel: string;
  phoneIcon: string;
}>;

const hoursRow = (facts: PlaceFacts): string =>
  branch((facts.hours ?? '') === '')(
    () => '',
    () =>
      `<span class="map-pop-fact map-pop-hours" title="${escapeAttr(facts.hoursLabel)}">${facts.hoursIcon}<span>${escapeAttr(clipText(HOURS_LIMIT)(facts.hours ?? ''))}</span></span>`,
  );

const phoneRow = (facts: PlaceFacts): string =>
  branch((facts.phone ?? '') === '')(
    () => '',
    () => `<span class="map-pop-fact" title="${escapeAttr(facts.phoneLabel)}">${facts.phoneIcon}${escapeAttr(facts.phone ?? '')}</span>`,
  );

/** The facts row, or an empty string when the place carries neither fact. */
export const placeFactsHtml = (facts: PlaceFacts): string => {
  const rows = `${hoursRow(facts)}${phoneRow(facts)}`;
  return branch(rows === '')(
    () => '',
    () => `<div class="map-pop-facts">${rows}</div>`,
  );
};
