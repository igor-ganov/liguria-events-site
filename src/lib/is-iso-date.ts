const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Whether the text is a bare calendar date, `YYYY-MM-DD`. Shape only — it does
 *  not reject an impossible day, which is the database's business. */
export const isIsoDate = (value: string): boolean => ISO_DATE.test(value);
