/** The stored code record: the 6-digit code, the link token issued with it (so
 *  consuming one kills the other) and how many wrong codes were tried. */
export type CodeRecord = { code: string; token: string; attempts: number };
