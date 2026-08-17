/** The things the map has to tell a visitor — all of them consequences of the
 *  basemap and the place shards being finite. */
export type ToastKey = 'outside' | 'denied' | 'error' | 'zoomIn';

const MSG: Readonly<Record<ToastKey, Readonly<Record<string, string>>>> = {
  outside: {
    en: 'You are outside the map area (Genoa / Liguria).',
    it: 'Sei fuori dall’area della mappa (Genova / Liguria).',
    ru: 'Вы вне области карты (Генуя / Лигурия).',
  },
  denied: {
    en: 'Location access is blocked — allow it in the browser.',
    it: 'Accesso alla posizione bloccato — consentilo nel browser.',
    ru: 'Доступ к геолокации запрещён — разрешите его в браузере.',
  },
  error: {
    en: 'Could not determine your location.',
    it: 'Impossibile determinare la posizione.',
    ru: 'Не удалось определить местоположение.',
  },
  zoomIn: {
    en: 'Zoom in to a region to see places.',
    it: 'Ingrandisci su una zona per vedere i locali.',
    ru: 'Приблизьтесь к области, чтобы увидеть места.',
  },
};

/** A toast's text in the viewed language, falling back to English. These live
 *  here rather than in the UI dict: they are map-mechanics messages, not page
 *  copy, and the map script must be able to raise one before any island loads. */
export const toastText = (key: ToastKey, lang: string): string =>
  MSG[key][lang] ?? MSG[key]['en'] ?? '';
