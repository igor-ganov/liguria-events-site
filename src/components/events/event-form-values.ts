/** The JSON body the create/edit endpoints take, read off the submitted form.
 *  Every field is sent, empty or not, so an edit can clear one. */
export const eventFormValues = (data: FormData): Record<string, unknown> => {
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
  };
};
