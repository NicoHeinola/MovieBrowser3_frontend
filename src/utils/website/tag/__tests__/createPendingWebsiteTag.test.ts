import { describe, expect, it } from 'vitest';

import { createPendingWebsiteTag } from '../createPendingWebsiteTag';

describe('createPendingWebsiteTag', () => {
  it('starts at -1', () => {
    expect(createPendingWebsiteTag('music', [])).toEqual({ id: -1, name: 'music' });
  });

  it('counts down from the lowest pending id', () => {
    const pendingTags = [
      { id: -1, name: 'a' },
      { id: -3, name: 'b' },
    ];

    expect(createPendingWebsiteTag('c', pendingTags)).toEqual({ id: -4, name: 'c' });
  });
});
