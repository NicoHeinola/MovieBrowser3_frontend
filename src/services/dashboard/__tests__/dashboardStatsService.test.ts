import type { DashboardStatsResponse } from '@/interfaces/api/responses/DashboardStatsResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { dashboardStatsService } from '../dashboardStatsService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('dashboardStatsService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('gets the dashboard stats', async () => {
    const stats: DashboardStatsResponse = {
      shows_count: 40,
      shows_added_last_7_days: 2,
      shows_added_last_30_days: 5,
      episodes_count: 512,
      websites_count: 12,
      users_count: 3,
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse(stats));

    await expect(dashboardStatsService.get()).resolves.toEqual(stats);
    expect(apiClient.get).toHaveBeenCalledWith('dashboard-stats');
  });
});
