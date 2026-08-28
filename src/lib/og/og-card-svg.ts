import { branch } from '../branch.ts';
import { escapeSvg } from './escape-svg.ts';
import { wrapLine } from './wrap-line.ts';

/** What a link preview is cropped to, everywhere. */
const W = 1200;
const H = 630;
const LANE = 96;
const TITLE_WIDTH = 26;

export type OgCard = Readonly<{
  title: string;
  when: string;
  place: string;
  madeHere: boolean;
}>;

const titleLines = (title: string): string =>
  wrapLine(title, TITLE_WIDTH, 3)
    .map(
      (line, index) =>
        `<text x="${LANE}" y="${232 + index * 78}" class="t">${escapeSvg(line)}</text>`,
    )
    .join('');

const madeMark = (madeHere: boolean): string =>
  branch(madeHere)(
    () => `<text x="${LANE}" y="150" class="m">creato qui · made here</text>`,
    () => '',
  );

/**
 * The card that appears when somebody pastes an event link into a chat. Every
 * event without a photo of its own used to get the same branded rectangle,
 * which says nothing about what the reader is being invited to.
 *
 * Drawn in the site's own hand: the thread down the lane with the event's stop
 * on it, filled when the event was made here.
 */
export const ogCardSvg = ({ title, when, place, madeHere }: OgCard): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  `<style>` +
  `.t{font-family:Fraunces,Georgia,serif;font-size:64px;fill:#20232a}` +
  `.w{font-family:Rubik,sans-serif;font-size:30px;fill:#767b84}` +
  `.m{font-family:Rubik,sans-serif;font-size:24px;fill:#c2703f;letter-spacing:2px}` +
  `.b{font-family:Fraunces,Georgia,serif;font-size:30px;fill:#33697a}` +
  `</style>` +
  `<rect width="${W}" height="${H}" fill="#fbfaf7"/>` +
  `<path d="M46,0 C42,120 52,240 46,360 C40,480 50,560 46,630" fill="none" stroke="#33697a" stroke-width="3" opacity="0.72"/>` +
  `<circle cx="46" cy="212" r="11" fill="${branch(madeHere)(() => '#c2703f', () => '#fbfaf7')}" stroke="${branch(madeHere)(() => '#c2703f', () => '#33697a')}" stroke-width="3"/>` +
  madeMark(madeHere) +
  titleLines(title) +
  `<text x="${LANE}" y="492" class="w">${escapeSvg(when)}</text>` +
  `<text x="${LANE}" y="536" class="w">${escapeSvg(place)}</text>` +
  `<text x="${LANE}" y="590" class="b">Dove Go</text>` +
  `</svg>`;
