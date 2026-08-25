/** The JSON body the create/edit endpoints take, read off the submitted form.
 *  Every field is sent, empty or not, so an edit can clear one — including the
 *  kind and the programme, so unticking the box really does turn a container
 *  back into a plain run. */
export const eventFormValues = (
  data: FormData,
  sessions: readonly Record<string, string>[] = [],
): Record<string, unknown> => {
  const text = (key: string): string => String(data.get(key) ?? '');
  return {
    title: text('title'),
    description: text('description'),
    startDate: text('startDate'),
    endDate: text('endDate'),
    venue: text('venue'),
    address: text('address'),
    phone: text('phone'),
    website: text('website'),
    coverImage: text('coverImage'),
    lat: text('lat'),
    lng: text('lng'),
    categories: data.getAll('category'),
    free: data.get('free') === 'on',
    // Opt-in: unticked means the private case, which is the default.
    listed: data.get('listed') === 'on',
    kind: [data.get('container')].filter((v) => v === 'on').map(() => 'container').at(0) ?? 'standalone',
    sessions,
  };
};
