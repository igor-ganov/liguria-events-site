/**
 * Render an event description written as light Markdown into a structured
 * article: a lead paragraph followed by short labelled sections (Programme,
 * Getting there, Tickets, …) rather than one undifferentiated wall of text.
 *
 * The input comes from our own enrichment pipeline, but it embeds source text,
 * so everything is HTML-escaped first and only a tiny, fixed Markdown subset is
 * then re-introduced (headings, bullet lists, bold) — no raw HTML survives.
 */

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Bold spans, applied AFTER escaping (the `*` markers survive escaping).
const inline = (text: string): string =>
  text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

// A section label: a `## Heading`, or a whole line that is entirely bold.
const HEADING = /^(?:#{2,4}\s+(.*)|\*\*(.+)\*\*)$/;
const BULLET = /^[-*•]\s+(.*)$/;

export const descriptionArticleHtml = (markdown: string): string => {
  const lines = escapeHtml(markdown).split(/\r?\n/);
  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = (): void => {
    if (para.length > 0) {
      out.push(`<p>${inline(para.join(' '))}</p>`);
      para = [];
    }
  };
  const flushList = (): void => {
    if (list.length > 0) {
      out.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`);
      list = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') {
      flushPara();
      flushList();
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      flushPara();
      flushList();
      out.push(`<h3 class="desc-h">${inline(heading[1] ?? heading[2] ?? '')}</h3>`);
      continue;
    }
    const bullet = BULLET.exec(line);
    if (bullet) {
      flushPara();
      list.push(bullet[1] ?? '');
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return out.join('');
};

/** Strip the Markdown to a single-line plain string for meta tags, cards and
 *  search indexing — where the section markers would otherwise leak through. */
export const descriptionPlain = (markdown: string): string =>
  markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
