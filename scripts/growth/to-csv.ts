const cell = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

/** Google Ads Editor reads a plain CSV; a stray quote in a venue name is the
 *  difference between an import and a support ticket. */
export const toCsv = (rows: readonly (readonly string[])[]): string =>
  rows.map((row) => row.map(cell).join(',')).join('\r\n');
