import type { ShowTemplate } from '@/interfaces/api/models/ShowTemplate';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Describes the show behind an outside page, such as a nekoBT media page. Nothing is saved.
 * @param url - The page's address.
 * @returns The show template.
 */
const get = async (url: string): Promise<ShowTemplate> => {
  const response = await apiClient.get<ShowTemplate>('show-template', { params: { url } });

  return response.data;
};

export const showTemplateService = {
  get,
};
