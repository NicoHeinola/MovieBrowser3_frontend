import type { SetupChecks } from '@/interfaces/api/models/SetupChecks';
import type { SetupStatus } from '@/interfaces/api/models/SetupStatus';
import type { SetupCheckRequest } from '@/interfaces/api/requests/SetupCheckRequest';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Gets whether the first-login setup is done, with the hints the setup wizard suggests.
 * @returns The setup status.
 */
const get = async (): Promise<SetupStatus> => {
  const response = await apiClient.get<SetupStatus>('setup');

  return response.data;
};

/**
 * Checks setup paths without saving them, such as whether VLC exists at a path.
 * @param request - The paths to check; the ones left out are not checked.
 * @returns One result per checked path.
 */
const check = async (request: SetupCheckRequest): Promise<SetupChecks> => {
  const response = await apiClient.post<SetupChecks>('setup/checks', request);

  return response.data;
};

/**
 * Marks the first-login setup as done, so admins are no longer sent to it.
 * @returns The updated setup status.
 */
const complete = async (): Promise<SetupStatus> => {
  const response = await apiClient.post<SetupStatus>('setup/complete');

  return response.data;
};

export const setupService = {
  get,
  check,
  complete,
};
