import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { downloadFileService } from '../downloadFileService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: { put: vi.fn() },
}));

describe('downloadFileService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('replaces the picked files of a download', async () => {
    const request = { show_id: 7, files: [{ index: 0, episode_id: 12 }] };

    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { id: 4 } });

    await expect(downloadFileService.update(4, request)).resolves.toEqual({ id: 4 });
    expect(apiClient.put).toHaveBeenCalledWith('downloads/4/files', request);
  });
});
