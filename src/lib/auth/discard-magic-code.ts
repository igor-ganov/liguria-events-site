import { MAGIC } from './magic-config.ts';
import type { CodeRecord } from './magic-record.ts';

/** Drop a code record and the link token issued with it (same order as before):
 *  used both when the code is accepted and when the attempts run out. */
export const discardMagicCode = async (kv: KVNamespace, email: string, rec: CodeRecord): Promise<void> => {
  await kv.delete(`${MAGIC.codePrefix}${email}`);
  await kv.delete(`${MAGIC.tokenPrefix}${rec.token}`);
};
