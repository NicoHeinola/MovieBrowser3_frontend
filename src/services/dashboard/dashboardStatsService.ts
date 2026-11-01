import type { DashboardStatsResponse } from '@/interfaces/api/responses/DashboardStatsResponse';

import { apiClient } from '@/plugins/api/apiClient';

const get = async (): Promise<DashboardStatsResponse> => {
  const response = await apiClient.get<DashboardStatsResponse>('dashboard-stats');

  return response.data;
};

export const dashboardStatsService = {
  get,
};
