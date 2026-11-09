import { describe, expect, it, vi } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { MIXED_WATCH_STATUS } from '@/utils/show/mixedWatchStatus';
import { useEntryWatchStatusOptions } from '../useEntryWatchStatusOptions';
import { useShowWatchStatusOptions } from '../useShowWatchStatusOptions';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

describe('watch status options', () => {
  it('offers a translated chip for every watch status', () => {
    const { options } = useEntryWatchStatusOptions();

    expect(options.value.map((option) => option.value)).toEqual(Object.values(WatchStatus));
    expect(options.value[0]).toMatchObject({ text: `showEntry.watchStatus.${Object.values(WatchStatus)[0]}` });
  });

  it('adds a mixed chip for whole shows, after the entry statuses', () => {
    const { options } = useShowWatchStatusOptions();

    const values = options.value.map((option) => option.value);
    expect(values).toEqual([...Object.values(WatchStatus), MIXED_WATCH_STATUS.value]);
    expect(options.value.at(-1)).toMatchObject({ text: 'show.mixed' });
  });
});
