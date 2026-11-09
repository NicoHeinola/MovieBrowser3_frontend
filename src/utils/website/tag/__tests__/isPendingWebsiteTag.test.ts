import { describe, expect, it } from 'vitest';

import { isPendingWebsiteTag } from '../isPendingWebsiteTag';

describe('isPendingWebsiteTag', () => {
  it('treats negative ids as pending', () => {
    expect(isPendingWebsiteTag({ id: -1 })).toBe(true);
    expect(isPendingWebsiteTag({ id: 4 })).toBe(false);
  });
});
