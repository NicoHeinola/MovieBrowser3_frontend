import type { Backup } from '@/interfaces/api/models/Backup';
import type { ListResponse } from '@/interfaces/api/responses/ListResponse';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { backupService } from '../backupService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

beforeEach(() => {
  vi.resetAllMocks();
});

describe('backupService', () => {
  it('lists the backups as received', async () => {
    const backups: ListResponse<Backup> = {
      data: [{ name: 'moviebrowser3-20261115-030000.dump', size: 1_234_567, created_at: '2026-11-15T03:00:00Z' }],
    };
    vi.mocked(apiClient.get).mockResolvedValue(createResponse(backups));

    await expect(backupService.list()).resolves.toEqual(backups);
    expect(apiClient.get).toHaveBeenCalledWith('backups');
  });

  it('backs up and returns the new backup', async () => {
    const backup = { name: 'moviebrowser3-20261115-200000.dump', size: 1_234_567, created_at: '2026-11-15T20:00:00Z' };
    vi.mocked(apiClient.post).mockResolvedValue(createResponse(backup));

    await expect(backupService.create()).resolves.toEqual(backup);
    expect(apiClient.post).toHaveBeenCalledWith('backups');
  });
});
