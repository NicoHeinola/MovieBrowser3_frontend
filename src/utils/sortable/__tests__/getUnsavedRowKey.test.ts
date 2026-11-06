import { describe, expect, it } from 'vitest';
import { reactive } from 'vue';
import { getUnsavedRowKey } from '../getUnsavedRowKey';

describe('getUnsavedRowKey', () => {
  it('keeps the key of a row', () => {
    const row = {};

    expect(getUnsavedRowKey(row)).toBe(getUnsavedRowKey(row));
  });

  it('gives a reactive row the same key as its raw object', () => {
    const row = {};

    expect(getUnsavedRowKey(reactive(row))).toBe(getUnsavedRowKey(row));
  });

  it('gives each row its own key', () => {
    expect(getUnsavedRowKey({})).not.toBe(getUnsavedRowKey({}));
  });
});
