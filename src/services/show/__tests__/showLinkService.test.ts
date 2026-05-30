import type { ShowLink } from '@/interfaces/api/models/ShowLink';
import type { CreateShowLinkRequest } from '@/interfaces/api/requests/CreateShowLinkRequest';
import type { UpdateShowLinkRequest } from '@/interfaces/api/requests/UpdateShowLinkRequest';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowLinkType } from '@/enums/show/ShowLinkType';
import { apiClient } from '@/plugins/api/apiClient';

import { showLinkService } from '../showLinkService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('showLinkService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists and gets show links', async () => {
    const links: ShowLink[] = [
      {
        id: 30,
        source_show_id: 4,
        target_show_id: 9,
        type: ShowLinkType.Sequel,
      },
    ];

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(createResponse(links))
      .mockResolvedValueOnce(createResponse(links[0]));

    await expect(showLinkService.list(4)).resolves.toEqual(links);
    await expect(showLinkService.get(30)).resolves.toEqual(links[0]);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'shows/4/links');
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'links/30');
  });

  it('creates and updates show links', async () => {
    const createRequest: CreateShowLinkRequest = {
      target_show_id: 9,
      type: ShowLinkType.SuggestedNext,
    };
    const updateRequest: UpdateShowLinkRequest = {
      target_show_id: 10,
      type: ShowLinkType.SpinOff,
    };
    const createdLink: ShowLink = {
      id: 31,
      source_show_id: 4,
      target_show_id: 9,
      type: ShowLinkType.SuggestedNext,
    };
    const updatedLink: ShowLink = {
      id: 31,
      source_show_id: 4,
      target_show_id: 10,
      type: ShowLinkType.SpinOff,
    };

    vi.mocked(apiClient.post).mockResolvedValue(createResponse(createdLink));
    vi.mocked(apiClient.put).mockResolvedValue(createResponse(updatedLink));

    await expect(showLinkService.create(4, createRequest)).resolves.toEqual(createdLink);
    await expect(showLinkService.update(31, updateRequest)).resolves.toEqual(updatedLink);

    expect(apiClient.post).toHaveBeenCalledWith('shows/4/links', createRequest);
    expect(apiClient.put).toHaveBeenCalledWith('links/31', updateRequest);
  });

  it('deletes show links', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(showLinkService.deleteLink(40)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('links/40');
  });
});
