// What is stored under a name that is written over again. Everything else is
// named after what it holds, so a different file is a different address.
const REWRITTEN = ['reports/'];

/** Whether a stored file keeps its name when its content changes — which is
 *  what decides that nothing may hold on to a copy of it. */
export const isRewrittenUpload = (key: string): boolean => REWRITTEN.some((prefix) => key.startsWith(prefix));
