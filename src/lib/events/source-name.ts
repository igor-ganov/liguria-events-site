/** 'visitgenoa' → 'visitgenoa.it', 'tg:genova' → 't.me/genova' — human labels. */
export const sourceName = (source: string): string => {
  const names: Readonly<Record<string, string>> = {
    visitgenoa: 'visitgenoa.it',
    mentelocale: 'mentelocale.it',
    genovateatro: 'genovateatro.it',
    palazzoducale: 'palazzoducale.genova.it',
    portoantico: 'portoantico.it',
  };
  return names[source] ?? source.replace(/^tg:/, 't.me/');
};
