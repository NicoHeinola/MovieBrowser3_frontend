import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { useDebouncedSearch } from '../useDebouncedSearch';

describe('useDebouncedSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('trims the text and lets the term out once typing pauses', async () => {
    const { search, term, debouncedTerm, isWaiting } = useDebouncedSearch();

    search.value = ' spy x ';
    await nextTick();

    expect(term.value).toBe('spy x');
    expect(debouncedTerm.value).toBe('');
    expect(isWaiting.value).toBe(true);

    vi.advanceTimersByTime(300);
    await nextTick();

    expect(debouncedTerm.value).toBe('spy x');
    expect(isWaiting.value).toBe(false);
  });

  it('starts from the given text without waiting', () => {
    const { term, debouncedTerm, isWaiting } = useDebouncedSearch(' Frieren ');

    expect(term.value).toBe('Frieren');
    expect(debouncedTerm.value).toBe('Frieren');
    expect(isWaiting.value).toBe(false);
  });

  it('reads a cleared field as empty', () => {
    const { search, term } = useDebouncedSearch('x');

    search.value = null as unknown as string;

    expect(term.value).toBe('');
  });
});
