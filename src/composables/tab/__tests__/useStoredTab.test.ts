import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import { useStoredTab } from '../useStoredTab';

const KEY = 'testTab';

describe('useStoredTab', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens the first tab by default', () => {
    expect(useStoredTab(KEY, ['a', 'b']).value).toBe('a');
  });

  it('opens the stored tab', () => {
    localStorage.setItem(KEY, 'b');

    expect(useStoredTab(KEY, ['a', 'b']).value).toBe('b');
  });

  it('opens the first tab when the stored value is no tab', () => {
    localStorage.setItem(KEY, 'gone');

    expect(useStoredTab(KEY, ['a', 'b']).value).toBe('a');
  });

  it('stores the opened tab', async () => {
    const tab = useStoredTab(KEY, ['a', 'b']);

    tab.value = 'b';
    await nextTick();

    expect(tab.value).toBe('b');
    expect(localStorage.getItem(KEY)).toBe('b');
  });
});
