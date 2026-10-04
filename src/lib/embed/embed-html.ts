import { branch } from '../branch.ts';
import { escapeMarkup as esc } from '../escape-markup.ts';
import type { EmbedRow } from './embed-rows.ts';

const EMPTY = 'Nessun evento in programma al momento.';

const row = (item: EmbedRow): string =>
  `<li><a href="${esc(item.href)}" target="_blank" rel="noopener"><span class="w">${esc(item.when)}</span>` +
  `<span class="t">${esc(item.title)}</span></a></li>`;

/**
 * The widget's whole document: no fonts, no framework, no tracking.
 *
 * It is served into somebody else's page, so it brings nothing with it — a
 * stylesheet of twenty lines, system type, and the venue's own events. The
 * height goes out by postMessage, because an iframe cannot size itself.
 */
export const embedHtml = (name: string, rows: readonly EmbedRow[], page: string): string =>
  `<!doctype html><html lang="it"><head><meta charset="utf-8">` +
  `<meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(name)}</title>` +
  `<style>:root{color-scheme:light dark}` +
  `*{box-sizing:border-box}body{margin:0;font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1b2029;background:transparent}` +
  `@media (prefers-color-scheme:dark){body{color:#e8eaed}.d{border-color:#3a3f48!important}.w{color:#9aa3b0!important}}` +
  `h2{margin:0 0 .6rem;font-size:1rem;letter-spacing:.01em}` +
  `ul{list-style:none;margin:0;padding:0}li{border-top:1px solid #e3dfd6}li:first-child{border-top:0}` +
  `a{display:flex;gap:.7rem;align-items:baseline;padding:.55rem 0;text-decoration:none;color:inherit}` +
  `a:hover .t{text-decoration:underline}` +
  `.w{flex:0 0 auto;color:#5e6878;font-size:.82rem;white-space:nowrap}` +
  `.t{font-weight:600}` +
  `.f{margin-top:.7rem;font-size:.78rem}.f a{display:inline;color:#5e6878;padding:0}` +
  `.e{color:#5e6878;padding:.5rem 0}` +
  `</style></head><body class="d">` +
  `<h2>${esc(name)}</h2>` +
  branch(rows.length === 0)(
    () => `<p class="e">${EMPTY}</p>`,
    () => `<ul>${rows.map(row).join('')}</ul>`,
  ) +
  `<p class="f"><a href="${esc(page)}" target="_blank" rel="noopener">Calendario completo su Dove Go</a></p>` +
  `<script>(function(){var s=function(){parent.postMessage({dovego:'height',px:document.documentElement.scrollHeight},'*')};` +
  `addEventListener('load',s);addEventListener('resize',s);s()})()</script>` +
  `</body></html>`;
