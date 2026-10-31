import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';

import { describe, expect, it } from 'vitest';

import { getWebsiteTagSearchState } from '../getWebsiteTagSearchState';

const tags: WebsiteTag[] = [
  { id: 1, name: 'Docs' },
  { id: 2, name: 'tools' },
  { id: -1, name: 'recipes' },
];

describe('getWebsiteTagSearchState', () => {
  it('offers nothing for a blank search', () => {
    expect(getWebsiteTagSearchState(' '.repeat(3), tags, [])).toEqual({
      name: '',
      exactMatch: undefined,
      canCreate: false,
      hasVisibleMatches: true,
    });
    expect(getWebsiteTagSearchState(null, tags, []).canCreate).toBe(false);
  });

  it('allows creating a name no tag has, even when nothing matches', () => {
    const state = getWebsiteTagSearchState('  Music ', tags, []);

    expect(state.name).toBe('Music');
    expect(state.canCreate).toBe(true);
    expect(state.hasVisibleMatches).toBe(false);
  });

  it('allows creating a name that only partly matches a tag', () => {
    const state = getWebsiteTagSearchState('doc', tags, []);

    expect(state.canCreate).toBe(true);
    expect(state.hasVisibleMatches).toBe(true);
  });

  it('finds an exact match ignoring case, including pending tags, and blocks creating it', () => {
    expect(getWebsiteTagSearchState('DOCS', tags, []).exactMatch).toEqual(tags[0]);
    expect(getWebsiteTagSearchState('DOCS', tags, []).canCreate).toBe(false);
    expect(getWebsiteTagSearchState('Recipes', tags, []).exactMatch).toEqual(tags[2]);
  });

  it('ignores selected tags when deciding what the list shows', () => {
    const state = getWebsiteTagSearchState('doc', tags, [1]);

    expect(state.hasVisibleMatches).toBe(false);
    expect(state.canCreate).toBe(true);
  });
});
