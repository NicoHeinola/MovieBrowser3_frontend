import { describe, expect, it } from 'vitest';

import { nyaaMirrors } from '../nyaaMirrors';

describe('nyaaMirrors', () => {
  it('lists unique https mirrors whose url matches their host', () => {
    expect(nyaaMirrors.length).toBeGreaterThan(0);
    expect(new Set(nyaaMirrors.map((mirror) => mirror.host)).size).toBe(nyaaMirrors.length);

    for (const mirror of nyaaMirrors) {
      expect(mirror.url).toBe(`https://${mirror.host}`);
    }
  });
});
