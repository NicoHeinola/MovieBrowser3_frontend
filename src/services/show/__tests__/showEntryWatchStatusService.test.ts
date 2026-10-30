import type { ShowEntryWatchStatus } from '@/interfaces/api/models/ShowEntryWatchStatus';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { apiClient } from '@/plugins/api/apiClient';

import { showEntryWatchStatusService } from '../showEntryWatchStatusService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('showEntryWatchStatusService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('sets the status of a show entry', async () => {
    const status: ShowEntryWatchStatus = { show_entry_id: 7, status: WatchStatus.OnHold };

    vi.mocked(apiClient.put).mockResolvedValue(createResponse(status));

    await expect(showEntryWatchStatusService.update(7, { status: WatchStatus.OnHold })).resolves.toEqual(status);

    expect(apiClient.put).toHaveBeenCalledWith('show-entries/7/watch-status', { status: WatchStatus.OnHold });
  });

  it('clears the status of a show entry', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(showEntryWatchStatusService.remove(7)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('show-entries/7/watch-status');
  });
});
