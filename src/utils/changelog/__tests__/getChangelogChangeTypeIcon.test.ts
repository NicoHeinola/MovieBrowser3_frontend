import { describe, expect, it } from 'vitest';

import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';
import { getChangelogChangeTypeIcon } from '../getChangelogChangeTypeIcon';

describe('getChangelogChangeTypeIcon', () => {
  it('returns an icon for every change type', () => {
    for (const type of Object.values(ChangelogChangeType)) {
      expect(getChangelogChangeTypeIcon(type)).toMatch(/^mdi-/);
    }
  });
});
