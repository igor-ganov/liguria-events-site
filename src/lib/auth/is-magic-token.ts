const TOKEN_SHAPE = /^[0-9a-f]{32}$/;

/** The shape `randomToken` issues: 32 lowercase hex characters. Anything else
 *  is refused before KV is even asked. */
export const isMagicToken = (value: string): boolean => TOKEN_SHAPE.test(value);
