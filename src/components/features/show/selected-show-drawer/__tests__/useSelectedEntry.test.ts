import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import { describe, expect, it } from 'vitest';
import { ref } from 'vue';

import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { useSelectedEntry } from '../useSelectedEntry';

const createEntry = (id: number, status: WatchStatus | null = null): ShowEntry => ({
  id,
  show_id: 1,
  type: ShowEntryType.Season,
  name: `Season ${id}`,
  sort_order: id,
  watch_status: status ? { show_entry_id: id, status } : null,
});

describe('useSelectedEntry', () => {
  it('keeps the selection when the cache replaces the entries', () => {
    const entries = ref<ShowEntry[]>([createEntry(1), createEntry(2)]);
    const { selectedEntry } = useSelectedEntry(entries);

    selectedEntry.value = entries.value[1]!;
    entries.value = [createEntry(1), createEntry(2, WatchStatus.Completed)];

    expect(selectedEntry.value?.id).toBe(2);
    expect(selectedEntry.value?.watch_status?.status).toBe(WatchStatus.Completed);
  });

  it('drops the selection when the entry disappears', () => {
    const entries = ref<ShowEntry[]>([createEntry(1), createEntry(2)]);
    const { selectedEntry } = useSelectedEntry(entries);

    selectedEntry.value = entries.value[1]!;
    entries.value = [createEntry(1)];

    expect(selectedEntry.value).toBeNull();
  });

  it('clears the selection', () => {
    const entries = ref<ShowEntry[]>([createEntry(1)]);
    const { clearSelectedEntry, selectedEntry } = useSelectedEntry(entries);

    selectedEntry.value = entries.value[0]!;
    clearSelectedEntry();

    expect(selectedEntry.value).toBeNull();
  });
});
