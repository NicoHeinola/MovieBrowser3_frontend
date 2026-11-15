import type { Backup } from '@/interfaces/api/models/Backup';
import type { ListResponse } from '@/interfaces/api/responses/ListResponse';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Reads the dumps kept on disk.
 * @returns The backups, newest first.
 */
const list = async (): Promise<ListResponse<Backup>> => {
  const response = await apiClient.get<ListResponse<Backup>>('backups');

  return response.data;
};

/**
 * Backs up the database now. The request waits for the dump, which usually takes a second or two.
 * @returns The new backup.
 */
const create = async (): Promise<Backup> => {
  const response = await apiClient.post<Backup>('backups');

  return response.data;
};

export const backupService = {
  list,
  create,
};
