import { afterEach, describe, expect, it, vi } from 'vitest';

import { canAutoplaySound } from '../canAutoplaySound';

describe('canAutoplaySound', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('blocks sound before the user has interacted with the page', () => {
    vi.stubGlobal('navigator', { userActivation: { hasBeenActive: false } });

    expect(canAutoplaySound()).toBe(false);
  });

  it('allows sound once the user has interacted with the page', () => {
    vi.stubGlobal('navigator', { userActivation: { hasBeenActive: true } });

    expect(canAutoplaySound()).toBe(true);
  });

  it('allows sound when the browser cannot tell', () => {
    vi.stubGlobal('navigator', {});

    expect(canAutoplaySound()).toBe(true);
  });
});
