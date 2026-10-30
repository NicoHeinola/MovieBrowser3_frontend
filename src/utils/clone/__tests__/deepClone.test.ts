import { describe, expect, it } from 'vitest';
import { reactive } from 'vue';
import { deepClone } from '../deepClone';

describe('deepClone', () => {
  it('returns an independent deep copy', () => {
    const original = { id: 1, titles: [{ title: 'A' }] };

    const clone = deepClone(original);
    clone.titles[0].title = 'B';

    expect(clone).not.toBe(original);
    expect(original.titles[0].title).toBe('A');
  });

  it('clones reactive proxies', () => {
    const original = reactive({ nested: { value: 1 } });

    expect(deepClone(original)).toEqual({ nested: { value: 1 } });
  });

  it('passes primitives, null and undefined through', () => {
    expect(deepClone(5)).toBe(5);
    expect(deepClone(null)).toBeNull();
    expect(deepClone(undefined)).toBeUndefined();
  });
});
