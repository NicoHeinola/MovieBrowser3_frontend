import { describe, expect, it } from 'vitest';

import { sortFilesByName } from '../sortFilesByName';

describe('sortFilesByName', () => {
  it('orders numbers naturally and ignores case', () => {
    const files = [{ name: 'Show - 10.mkv' }, { name: 'show - 2.mkv' }, { name: 'Show - 1.mkv' }];

    expect(sortFilesByName(files).map((file) => file.name)).toEqual(['Show - 1.mkv', 'show - 2.mkv', 'Show - 10.mkv']);
  });

  it('does not change the input', () => {
    const files = [{ name: 'b.mkv' }, { name: 'a.mkv' }];

    sortFilesByName(files);

    expect(files.map((file) => file.name)).toEqual(['b.mkv', 'a.mkv']);
  });
});
