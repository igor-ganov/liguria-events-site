import { escapeXml } from './escape-xml.ts';
import { wrapText } from './wrap-text.ts';

/** The opening frame: what this is and where, before any photograph. Two
 *  seconds is all a feed gives you to answer "is this about my city". */
export const coverSvg = (heading: string, sub: string): string => {
  const lines = wrapText(heading, 920, 88, 3);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#f2822a" stop-opacity="0.38"/>
      <stop offset="1" stop-color="#f2822a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1920" fill="#141210"/>
  <circle cx="900" cy="380" r="620" fill="url(#glow)"/>
  <g transform="translate(80,640) scale(3.2)">
    <path d="M16 1.6C8.6 1.6 2.6 7.5 2.6 14.9 2.6 24.4 16 38.4 16 38.4S29.4 24.4 29.4 14.9C29.4 7.5 23.4 1.6 16 1.6Z" fill="#f2822a"/>
    <path d="M8.2 16.4C10.7 12.7 13.6 12.7 16 16.4 18.4 20.1 21.3 20.1 23.8 16.4" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round"/>
  </g>
  <text y="960" font-family="Segoe UI, Arial, sans-serif" font-size="88" font-weight="700" fill="#ffffff">${lines
    .map((text, i) => `<tspan x="80" dy="${i === 0 ? 0 : 104}">${escapeXml(text)}</tspan>`)
    .join('')}</text>
  <rect x="80" y="1120" width="160" height="6" rx="3" fill="#f2822a"/>
  <text x="80" y="1240" font-family="Segoe UI, Arial, sans-serif" font-size="44" fill="#c9bfb4">${escapeXml(sub)}</text>
  <text x="80" y="1800" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="600" fill="#f2822a">dovego.it</text>
</svg>`;
};
