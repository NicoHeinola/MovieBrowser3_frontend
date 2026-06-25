import { describe, expect, it } from 'vitest';
import { getChangedObject } from '../hasObjectChanged';

describe('object change helpers', () => {
  it('returns false when primitive values are identical', () => {
    expect(getChangedObject(5, 5)).toBeUndefined();
    expect(getChangedObject('test', 'test')).toBeUndefined();
  });

  it('returns changed values when primitive values differ', () => {
    expect(getChangedObject(5, 6)).toBe(6);
    expect(getChangedObject('a', 'b')).toBe('b');
  });

  it('returns false for identical nested objects', () => {
    const original = { a: 1, b: { c: 2 } };
    const changed = { a: 1, b: { c: 2 } };

    expect(getChangedObject(original, changed)).toBeUndefined();
  });

  it('returns changed nested values for nested property changes', () => {
    const original = { a: 1, b: { c: 2 } };
    const changed = { a: 1, b: { c: 3 } };

    expect(getChangedObject(original, changed)).toEqual({ b: { c: 3 } });
  });

  it('returns false when a changed field is excluded', () => {
    const original = { a: 1, b: 2 };
    const changed = { a: 1, b: 3 };

    expect(getChangedObject(original, changed, { exclude: ['b'] })).toBeUndefined();
  });

  it('returns changed values when a non-excluded field changes', () => {
    const original = { a: 1, b: 2 };
    const changed = { a: 1, b: 3, c: 4 };

    expect(getChangedObject(original, changed, { exclude: ['a'] })).toEqual({ b: 3, c: 4 });
  });

  it('returns true when included field changes', () => {
    const original = { a: 1, b: 2 };
    const changed = { a: 3, b: 2 };

    expect(getChangedObject(original, changed, { include: ['a'] })).toEqual({ a: 3 });
  });

  it('returns undefined when only non-included fields change', () => {
    const original = { a: 1, b: 2 };
    const changed = { a: 1, b: 3 };

    expect(getChangedObject(original, changed, { include: ['a'] })).toBeUndefined();
  });

  it('returns false for nested excluded paths', () => {
    const original = { a: { b: 1, c: 2 } };
    const changed = { a: { b: 9, c: 2 } };

    expect(getChangedObject(original, changed, { exclude: ['a.b'] })).toBeUndefined();
  });

  it('returns changed arrays for array length changes', () => {
    expect(getChangedObject([1, 2], [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('returns changed arrays for array element changes', () => {
    expect(getChangedObject([1, 2], [1, 3])).toEqual([1, 3]);
  });

  it('supports include patterns with nested paths', () => {
    const original = { user: { name: 'alice', age: 30 }, admin: true };
    const changed = { user: { name: 'bob', age: 30 }, admin: true };

    expect(getChangedObject(original, changed, { include: ['user.name'] })).toEqual({ user: { name: 'bob' } });
    expect(getChangedObject(original, changed, { include: ['user.age'] })).toBeUndefined();
  });

  it('returns only changed nested values from getChangedObject', () => {
    const original = { a: 1, b: { c: 2, d: 3 }, e: 4 };
    const changed = { a: 1, b: { c: 9, d: 3 }, e: 4 };

    expect(getChangedObject(original, changed)).toEqual({ b: { c: 9 } });
  });

  it('returns `undefined` when getChangedObject has no changes', () => {
    const original = { a: 1, b: 2 };
    const changed = { a: 1, b: 2 };

    expect(getChangedObject(original, changed)).toBeUndefined();
  });
});
