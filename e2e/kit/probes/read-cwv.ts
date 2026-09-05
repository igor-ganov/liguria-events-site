/**
 * Layout shift, largest paint and the heaviest script, read off the page.
 *
 * Through PerformanceObserver with `buffered: true`, not getEntriesByType:
 * layout shifts and the largest paint are not in the entry list that method
 * reads, so asking it returns an empty array — which is indistinguishable from
 * a page that shifted nothing and is how a real regression scores perfectly.
 * The buffered observer replays what happened before anybody asked, which is
 * the load this is about.
 *
 * Self-contained on purpose: page.evaluate serialises the function, so it can
 * reference nothing from this module.
 */
export const readCwv = (): Promise<{
  cls: number;
  lcpMs: number | undefined;
  biggestJsKb: number | undefined;
}> =>
  new Promise((resolve) => {
    let cls = 0;
    let lcpMs: number | undefined = undefined;
    new PerformanceObserver((list) => {
      list
        .getEntries()
        .filter((entry) => Reflect.get(entry, 'hadRecentInput') !== true)
        .forEach((entry) => {
          cls += Number(Reflect.get(entry, 'value') ?? 0);
        });
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        lcpMs = Math.round(entry.startTime);
      });
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    const scripts = performance
      .getEntriesByType('resource')
      .filter((entry) => entry.name.endsWith('.js'))
      .map((entry) => Number(Reflect.get(entry, 'encodedBodySize') ?? 0));
    const biggestJsKb = [Math.round(Math.max(0, ...scripts) / 1024)]
      .filter(() => scripts.length > 0)
      .at(0);

    // Buffered entries are delivered a task later, so the read waits one
    // frame — long enough for the replay, short enough not to be a sleep.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => resolve({ cls: Number(cls.toFixed(3)), lcpMs, biggestJsKb })),
    );
  });
