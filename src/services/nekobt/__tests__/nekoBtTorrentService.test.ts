import type { NekoBtTorrent } from '@/interfaces/api/models/NekoBtTorrent';
import type { UncountedPaginatedResponse } from '@/interfaces/api/responses/UncountedPaginatedResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { nekoBtTorrentService } from '../nekoBtTorrentService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const createTorrent = (overrides: Partial<NekoBtTorrent> = {}): NekoBtTorrent => ({
  id: '7338487288586',
  title: '[Vodes] Youjo Senki S01 + ONA [BD 1080p HEVC 10bit FLAC]',
  size_bytes: 20_357_714_722,
  uploaded_at: '2025-11-28T18:46:05.000000Z',
  seeders: 3,
  leechers: 0,
  downloads: 269,
  comments: 0,
  is_batch: true,
  magnet_url: 'magnet:?xt=urn:btih:14bc7bf562f9504e30816b6403ab19b302e26ae2',
  torrent_url: 'https://nekobt.to/api/v1/torrents/7338487288586/download?public=true',
  view_url: 'https://nekobt.to/torrents/7338487288586',
  media_url: 'https://nekobt.to/media/s1453',
  ...overrides,
});

describe('nekoBtTorrentService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists a page of torrents with the query as params', async () => {
    const response: UncountedPaginatedResponse<NekoBtTorrent> = {
      data: [createTorrent()],
      links: { prev: null, next: 'http://localhost/api/v1/nekobt-torrents?page%5Bnumber%5D=2' },
      meta: { current_page: 1, per_page: 100, from: 1, to: 1 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: response });

    const query = { filter: { search: 'tanya' }, sort: '-size', page: { number: 1 } };

    await expect(nekoBtTorrentService.list(query)).resolves.toEqual(response);
    expect(apiClient.get).toHaveBeenCalledWith('nekobt-torrents', { params: query });
  });
});
