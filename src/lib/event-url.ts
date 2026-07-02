/** Internal detail-page URL for an event id, base-path aware. */
export const eventUrl = (id: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/event/${id}/`;
