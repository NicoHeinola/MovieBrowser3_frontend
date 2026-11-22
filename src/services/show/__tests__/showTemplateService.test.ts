import type { ShowTemplate } from '@/interfaces/api/models/ShowTemplate';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { showTemplateService } from '../showTemplateService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('showTemplateService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('gets the template of a page by its address', async () => {
    const template: ShowTemplate = {
      source_url: 'https://nekobt.to/media/s1453',
      titles: ['Saga of Tanya the Evil'],
      description: null,
      banner_url: null,
      card_image_url: null,
      preview_url: null,
      categories: [],
      unmatched_genres: [],
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: template });

    await expect(showTemplateService.get('https://nekobt.to/media/s1453')).resolves.toEqual(template);
    expect(apiClient.get).toHaveBeenCalledWith('show-template', { params: { url: 'https://nekobt.to/media/s1453' } });
  });
});
