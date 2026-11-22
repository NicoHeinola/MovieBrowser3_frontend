import { describe, expect, it } from 'vitest';

import { nekoBtAudioLanguages } from '../nekoBtAudioLanguages';

describe('nekoBtAudioLanguages', () => {
  it('lists unique lowercase language codes, Japanese first, and never the "any" choice', () => {
    expect(nekoBtAudioLanguages[0]).toBe('ja');
    expect(new Set(nekoBtAudioLanguages).size).toBe(nekoBtAudioLanguages.length);
    expect(nekoBtAudioLanguages.every((code) => /^[a-z]{2,3}(?:-[a-z0-9]{2,4})?$/.test(code))).toBe(true);
    expect(nekoBtAudioLanguages).not.toContain('any');
  });
});
