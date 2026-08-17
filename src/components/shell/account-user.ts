/** The signed-in viewer, as /api/auth/me reports them. */
export type AccountUser = Readonly<{ handle: string; role: string }>;
