import { describe, expect, it } from 'vitest';

import { formatRuntime } from '../formatRuntime';

describe('formatRuntime', () => {
  it('shows hours and minutes', () => {
    expect(formatRuntime(83 * 60, 'en')).toBe('1h 23m');
  });

  it('leaves out a second unit that is 0', () => {
    expect(formatRuntime(2 * 3600, 'en')).toBe('2h');
    expect(formatRuntime(3 * 86_400 + 20 * 60, 'en')).toBe('3d');
  });

  it('switches to days and hours from a day up', () => {
    expect(formatRuntime(2 * 86_400 + 5 * 3600 + 59 * 60, 'en')).toBe('2d 5h');
  });

  it('rounds to whole minutes', () => {
    expect(formatRuntime(24 * 60 + 31, 'en')).toBe('25m');
    expect(formatRuntime(59 * 60 + 45, 'en')).toBe('1h');
  });

  it('shows seconds under a minute', () => {
    expect(formatRuntime(45, 'en')).toBe('45s');
    expect(formatRuntime(-5, 'en')).toBe('0s');
  });

  it('uses the locale for unit names', () => {
    expect(formatRuntime(83 * 60, 'fi')).toBe('1t 23min');
  });
});
