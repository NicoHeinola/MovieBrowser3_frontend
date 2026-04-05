export const captureComponentEl = (els: HTMLElement[], el: unknown, index: number): void => {
  if (el) {
    els[index] = ((el as { $el?: HTMLElement }).$el ?? el) as HTMLElement;
  }
};
