import { describe, expect, it } from 'vitest';

import { toFormData } from '../toFormData';

describe('toFormData', () => {
  it('serializes primitive values', () => {
    const formData = toFormData({ name: 'Pilot', sequence_number: 1, published: true });

    expect(formData.get('name')).toBe('Pilot');
    expect(formData.get('sequence_number')).toBe('1');
    expect(formData.get('published')).toBe('true');
  });

  it('skips undefined values and serializes null as empty string', () => {
    const formData = toFormData({ name: 'Episode', optional: undefined, note: null });

    expect(formData.has('optional')).toBe(false);
    expect(formData.get('note')).toBe('');
  });

  it('serializes nested objects and arrays with bracket notation', () => {
    const formData = toFormData({
      metadata: { language: 'en' },
      tags: ['drama', 'pilot'],
    });

    expect(formData.get('metadata[language]')).toBe('en');
    expect(formData.get('tags[0]')).toBe('drama');
    expect(formData.get('tags[1]')).toBe('pilot');
  });

  it('keeps blob values as binary form-data entries', async () => {
    const blob = new Blob(['file-content'], { type: 'text/plain' });
    const formData = toFormData({ file: blob });

    const fileEntry = formData.get('file');

    expect(fileEntry).toBeInstanceOf(Blob);
    expect(fileEntry).not.toBeNull();
    expect(typeof fileEntry).not.toBe('string');

    if (typeof fileEntry !== 'string' && fileEntry !== null) {
      await expect(fileEntry.text()).resolves.toBe('file-content');
    }
  });
});
