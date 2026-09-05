/**
 * Resolve once the layout has stopped moving.
 *
 * The precondition every audit needs and none of them can state on their own:
 * measuring geometry while a late image, a font or a client-rendered account
 * slot is still landing gives a number that was true for one frame. That is
 * the whole anatomy of a spec that passes alone and fails under load — the
 * machine is slower, the late thing lands later, and the measurement catches
 * it mid-move.
 *
 * Quiet is defined by what the browser reports, not by a clock: two
 * consecutive animation frames with no layout shift in them. On a loaded
 * machine the frames are longer, so the wait grows with the machine instead of
 * expiring against it.
 *
 * The wall-clock backstop is a ceiling, not a settle signal, and it is there
 * for one specific failure: a browser that has decided this page is in the
 * background stops handing out animation frames altogether, and a wait built
 * only on frames then never returns. It cost a run before it existed.
 *
 * Self-contained on purpose: page.evaluate serialises the function.
 */
export const waitQuiet = ([maxFrames, ceilingMs]: readonly [number, number]): Promise<number> =>
  new Promise((resolve) => {
    let moved = false;
    const observer = new PerformanceObserver((list) => {
      moved = moved || list.getEntries().length > 0;
    });
    observer.observe({ type: 'layout-shift' });

    let frames = 0;
    let still = 0;
    const stop = (): void => {
      observer.disconnect();
      resolve(frames);
    };
    const backstop = setTimeout(stop, ceilingMs);
    const tick = (): void => {
      frames += 1;
      still = [moved].filter(Boolean).map(() => 0).at(0) ?? still + 1;
      moved = false;
      const done = still >= 2 || frames >= maxFrames;
      [done].filter(Boolean).forEach(() => {
        clearTimeout(backstop);
        stop();
      });
      [done].filter((over) => !over).forEach(() => requestAnimationFrame(tick));
    };
    requestAnimationFrame(tick);
  });
