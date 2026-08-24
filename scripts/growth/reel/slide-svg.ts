import { escapeXml } from './escape-xml.ts';
import { wrapText } from './wrap-text.ts';

export type Slide = Readonly<{ title: string; when: string; where: string; photo: string }>;

const W = 1080;
const H = 1920;
const TITLE_SIZE = 62;
const line = (text: string, index: number): string =>
  `<tspan x="80" dy="${index === 0 ? 0 : 74}">${escapeXml(text)}</tspan>`;

/** One frame: the photograph fills the top, the words sit on a ground dark
 *  enough to stay legible over any picture the sources hand us. */
export const slideSvg = (slide: Slide): string => {
  const lines = wrapText(slide.title, W - 160, TITLE_SIZE, 3);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <clipPath id="photo"><rect x="0" y="0" width="${W}" height="1180"/></clipPath>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#100e0c" stop-opacity="0"/>
      <stop offset="1" stop-color="#100e0c" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#100e0c"/>
  <g clip-path="url(#photo)">
    <image xlink:href="${slide.photo}" x="0" y="0" width="${W}" height="1180" preserveAspectRatio="xMidYMid slice"/>
  </g>
  <rect x="0" y="820" width="${W}" height="360" fill="url(#fade)"/>
  <rect x="80" y="1240" width="${Math.max(180, slide.when.length * 26 + 60)}" height="64" rx="32" fill="#f2822a"/>
  <text x="110" y="1284" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="#ffffff">${escapeXml(slide.when)}</text>
  <text y="1400" font-family="Segoe UI, Arial, sans-serif" font-size="${TITLE_SIZE}" font-weight="700" fill="#ffffff">${lines.map(line).join('')}</text>
  <text x="80" y="1660" font-family="Segoe UI, Arial, sans-serif" font-size="38" fill="#c9bfb4">${escapeXml(slide.where)}</text>
  <g transform="translate(80,1760) scale(1.5)">
    <path d="M16 1.6C8.6 1.6 2.6 7.5 2.6 14.9 2.6 24.4 16 38.4 16 38.4S29.4 24.4 29.4 14.9C29.4 7.5 23.4 1.6 16 1.6Z" fill="#f2822a"/>
    <path d="M8.2 16.4C10.7 12.7 13.6 12.7 16 16.4 18.4 20.1 21.3 20.1 23.8 16.4" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round"/>
  </g>
  <text x="150" y="1800" font-family="Segoe UI, Arial, sans-serif" font-size="36" font-weight="600" fill="#f2822a">dovego.it</text>
</svg>`;
};
