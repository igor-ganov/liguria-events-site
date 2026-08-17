import { branch } from '../../lib/branch.ts';

export type PdfSpot = Readonly<{ y: number; newPage: boolean }>;

/** Where the next line of the PDF goes: at the cursor, or at the top of a fresh
 *  page once the cursor has run past the bottom margin. */
export const placePdfLine = (y: number, bottom: number, top: number): PdfSpot => {
  const newPage = y > bottom;
  return {
    newPage,
    y: branch(newPage)<number>(
      () => top,
      () => y,
    ),
  };
};
