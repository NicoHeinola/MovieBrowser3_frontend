import { describe, expect, it } from 'vitest';

import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';
import { getChangelogChangeTypeColor } from '../getChangelogChangeTypeColor';

describe('getChangelogChangeTypeColor', () => {
  it('returns a color for every change type', () => {
    for (const type of Object.values(ChangelogChangeType)) {
      expect(getChangelogChangeTypeColor(type)).toBeTruthy();
    }
  });
});
