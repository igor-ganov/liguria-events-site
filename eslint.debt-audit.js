// Temporary audit config: the real config with BOTH waivers removed — the
// LEGACY DEBT list for .astro and the older per-path exemption list for .ts —
// so `eslint --config eslint.debt-audit.js` reports the violations still owed.
// Not referenced by any script; delete once both lists are empty.
import base from './eslint.config.js';

/** A block that switches the functional rules off for a set of paths. */
const isWaiver = (block) =>
  Array.isArray(block?.files) &&
  block?.rules?.['functional/max-lines-no-imports'] === 'off' &&
  block?.rules?.['no-restricted-syntax'] === 'off';

export default base.filter((block) => !isWaiver(block));
