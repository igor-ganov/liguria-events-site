import { branch } from '../branch.ts';
import type { Ui } from '../i18n/ui-schema.ts';

type Parts = Readonly<{ day: number; month: string; year: string }>;

const partsOf =
  (ui: Ui) =>
  (iso: string): Parts => {
    const [year = '', month = '', day = ''] = iso.split('-');
    return { day: Number(day), month: ui.months[Number(month) - 1] ?? '', year };
  };

const full = (parts: Parts): string => `${parts.day} ${parts.month} ${parts.year}`;

/**
 * '2026-09-12' → '12 Settembre 2026', and a run says both of its ends.
 *
 * The feed's own headings carry no year, which is right for a page about the
 * next fortnight and wrong for the archive: it spans seasons, and "12
 * Settembre" for something that happened last year reads as this year. Only
 * what changes between the two ends is repeated. Pure, no Intl, like every
 * other date label here.
 */
export const dayWithYear =
  (ui: Ui) =>
  (start: string, end?: string): string => {
    const from = partsOf(ui)(start);
    const to = partsOf(ui)(end ?? start);
    return branch(full(from) === full(to))(
      () => full(from),
      () =>
        branch(from.month === to.month && from.year === to.year)(
          () => `${from.day} – ${to.day} ${to.month} ${to.year}`,
          () =>
            branch(from.year === to.year)(
              () => `${from.day} ${from.month} – ${to.day} ${to.month} ${to.year}`,
              () => `${full(from)} – ${full(to)}`,
            ),
        ),
    );
  };
