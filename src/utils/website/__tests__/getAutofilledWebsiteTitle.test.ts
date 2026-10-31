import { describe, expect, it } from 'vitest';

import { getAutofilledWebsiteTitle } from '../getAutofilledWebsiteTitle';

describe('getAutofilledWebsiteTitle', () => {
  it('fills an empty title with a name guessed from the URL', () => {
    expect(getAutofilledWebsiteTitle('', null, 'https://www.github.com/nh')).toBe('Github');
    expect(getAutofilledWebsiteTitle(null, null, 'https://tetr.io')).toBe('Tetr io');
    expect(getAutofilledWebsiteTitle(' '.repeat(3), null, 'https://vuetifyjs.com')).toBe('Vuetifyjs');
  });

  it('follows a changed URL while the title is still the previous autofill', () => {
    expect(getAutofilledWebsiteTitle('Github', 'Github', 'https://gitlab.com')).toBe('Gitlab');
  });

  it('keeps a title the user typed', () => {
    expect(getAutofilledWebsiteTitle('My code', null, 'https://github.com')).toBeNull();
    expect(getAutofilledWebsiteTitle('My code', 'Github', 'https://gitlab.com')).toBeNull();
  });

  it('does nothing without a usable URL or when the title already matches', () => {
    expect(getAutofilledWebsiteTitle('', null, '')).toBeNull();
    expect(getAutofilledWebsiteTitle('', null, 'not a url')).toBeNull();
    expect(getAutofilledWebsiteTitle('Github', 'Github', 'https://github.com/other')).toBeNull();
  });
});
