import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';

import { overflowBlockScrollStrategy } from '../overflowBlockScrollStrategy';

/**
 * Opens an overlay the way Vuetify does: the strategy runs inside an effect scope that stops when the overlay closes.
 * @returns A function that closes the overlay.
 */
const openOverlay = (): (() => void) => {
  const scope = effectScope();
  scope.run(() => overflowBlockScrollStrategy());

  return () => scope.stop();
};

describe('overflowBlockScrollStrategy', () => {
  beforeEach(() => {
    vi.stubGlobal('innerWidth', 1015);
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1000 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hides the page overflow and pads for the scrollbar, without moving the page', () => {
    const close = openOverlay();

    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.documentElement.style.paddingInlineEnd).toBe('15px');
    expect(document.documentElement.style.position).toBe('');

    close();

    expect(document.documentElement.style.overflow).toBe('');
    expect(document.documentElement.style.paddingInlineEnd).toBe('');
  });

  it('keeps the page blocked until the last of several open dialogs closes', () => {
    const closeFirst = openOverlay();
    const closeSecond = openOverlay();

    closeSecond();
    expect(document.documentElement.style.overflow).toBe('hidden');

    closeFirst();
    expect(document.documentElement.style.overflow).toBe('');
  });
});
