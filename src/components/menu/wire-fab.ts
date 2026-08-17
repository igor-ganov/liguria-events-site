import { branch } from '../../lib/branch.ts';
import { cornerFrom } from './corner-from.ts';
import { fabXY } from './fab-xy.ts';
import { panelOffsets } from './panel-offsets.ts';
import { snapCorner } from './snap-corner.ts';
import type { Corner } from './corner.ts';
import type { FabParts } from './fab-parts.ts';

const SIZE = 56, MARGIN = 16, GAP = 8, THRESHOLD = 10, KEY = 'fab-corner';
const view = () => ({ width: innerWidth, height: innerHeight });

/** Drag-to-snap + open/close wiring for one flying menu: the 56px button is
 *  dragged to the nearest corner (persisted), and the popup follows it there. */
export const wireFab = (wrap: HTMLElement, { fab, overlay, panel }: FabParts): void => {
  let corner: Corner = cornerFrom(localStorage.getItem(KEY) ?? undefined);
  let dragging = false, moved = false, sX = 0, sY = 0;

  const placeFab = (x: number, y: number, animate: boolean): void => {
    fab.style.left = `${x}px`; fab.style.top = `${y}px`;
    fab.style.transition = branch(animate)(() => 'all var(--speed)', () => 'none');
  };
  const placePanel = (c: Corner): void => {
    const off = panelOffsets(c, `${MARGIN}px`, `${MARGIN + SIZE + GAP}px`);
    panel.style.left = off.left; panel.style.right = off.right;
    panel.style.top = off.top; panel.style.bottom = off.bottom;
  };
  const settle = (c: Corner): void => {
    corner = c; wrap.dataset['corner'] = c;
    const p = fabXY(c, SIZE, MARGIN, view()); placeFab(p.x, p.y, true); placePanel(c);
  };
  settle(corner);

  const open = (): void => { wrap.classList.add('open'); fab.setAttribute('aria-expanded', 'true'); panel.querySelector('a')?.focus(); };
  const close = (): void => { wrap.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); };
  const toggle = (): void => branch(wrap.classList.contains('open'))(close, open);
  const park = (e: PointerEvent): void => {
    const next = snapCorner(e.clientX, e.clientY, view()); localStorage.setItem(KEY, next); settle(next);
  };

  fab.addEventListener('pointerdown', (e) => { dragging = true; moved = false; sX = e.clientX; sY = e.clientY; fab.setPointerCapture(e.pointerId); });
  fab.addEventListener('pointermove', (e) => branch(dragging)(() => {
    const dx = e.clientX - sX, dy = e.clientY - sY;
    moved = moved || Math.abs(dx) + Math.abs(dy) > THRESHOLD;
    const b = fabXY(corner, SIZE, MARGIN, view()); placeFab(b.x + dx, b.y + dy, false);
  }, () => undefined));
  fab.addEventListener('pointerup', (e) => {
    dragging = false; fab.releasePointerCapture(e.pointerId);
    branch(moved)(() => park(e), toggle);
  });
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (e) => branch(e.key === 'Escape')(close, () => undefined));
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  addEventListener('resize', () => { const p = fabXY(corner, SIZE, MARGIN, view()); placeFab(p.x, p.y, false); });
};
