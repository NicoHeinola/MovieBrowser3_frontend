import type { Episode } from '@/interfaces/api/models/Episode';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { ShowLink } from '@/interfaces/api/models/ShowLink';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { CreateEpisodeRequest } from '@/interfaces/api/requests/CreateEpisodeRequest';
import type { CreateShowEntryRequest } from '@/interfaces/api/requests/CreateShowEntryRequest';
import type { CreateShowLinkRequest } from '@/interfaces/api/requests/CreateShowLinkRequest';
import type { UpdateEpisodeRequest } from '@/interfaces/api/requests/UpdateEpisodeRequest';
import type { UpdateShowEntryRequest } from '@/interfaces/api/requests/UpdateShowEntryRequest';
import type { UpdateShowLinkRequest } from '@/interfaces/api/requests/UpdateShowLinkRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { ShowLinkType } from '@/enums/show/ShowLinkType';
import { apiClient } from '@/plugins/api/apiClient';

import { showService } from '../showService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('showService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists shows with query params', async () => {
    const query: ApiQueryParams = {
      sort: '-created_at',
      filter: {
        search: 'gundam',
      },
      page: {
        number: 2,
        size: 12,
      },
    };
    const response: PaginatedResponse<Show> = {
      data: [
        {
          id: 1,
          banner_url: 'banner.jpg',
          card_image_url: 'card.jpg',
          preview_url: null,
          description: 'A show',
          titles: [{ title: 'Mobile Suit Gundam', is_primary: true }],
          entries: [],
          outgoingLinks: [],
          incomingLinks: [],
        },
      ],
      meta: {
        current_page: 2,
        last_page: 4,
        per_page: 12,
        total: 48,
      },
    };

    vi.mocked(apiClient.get).mockResolvedValue(createResponse(response));

    const result = await showService.list(query);

    expect(result).toEqual(response);
    expect(apiClient.get).toHaveBeenCalledWith('shows', {
      params: query,
    });
  });

  it('lists and gets show entries', async () => {
    const entries: ShowEntry[] = [
      {
        id: 10,
        show_id: 4,
        type: ShowEntryType.Season,
        name: 'Season 1',
        sort_order: 0,
        episodes: [],
      },
    ];

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(createResponse(entries))
      .mockResolvedValueOnce(createResponse(entries[0]));

    await expect(showService.listEntries(4)).resolves.toEqual(entries);
    await expect(showService.getEntry(10)).resolves.toEqual(entries[0]);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'shows/4/entries');
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'entries/10');
  });

  it('creates and updates show entries', async () => {
    const createRequest: CreateShowEntryRequest = {
      type: ShowEntryType.Movie,
      name: 'Compilation Movie',
      sort_order: 3,
    };
    const updateRequest: UpdateShowEntryRequest = {
      type: ShowEntryType.TvSpecial,
      name: 'TV Special',
      sort_order: 4,
    };
    const createdEntry: ShowEntry = {
      id: 12,
      show_id: 7,
      type: ShowEntryType.Movie,
      name: 'Compilation Movie',
      sort_order: 3,
    };
    const updatedEntry: ShowEntry = {
      id: 12,
      show_id: 7,
      type: ShowEntryType.TvSpecial,
      name: 'TV Special',
      sort_order: 4,
    };

    vi.mocked(apiClient.post).mockResolvedValue(createResponse(createdEntry));
    vi.mocked(apiClient.put).mockResolvedValue(createResponse(updatedEntry));

    await expect(showService.createEntry(7, createRequest)).resolves.toEqual(createdEntry);
    await expect(showService.updateEntry(12, updateRequest)).resolves.toEqual(updatedEntry);

    expect(apiClient.post).toHaveBeenCalledWith('shows/7/entries', createRequest);
    expect(apiClient.put).toHaveBeenCalledWith('entries/12', updateRequest);
  });

  it('deletes show entries', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(showService.deleteEntry(9)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('entries/9');
  });

  it('lists and gets episodes', async () => {
    const episodes: Episode[] = [
      {
        id: 21,
        show_entry_id: 10,
        name: 'Episode 1',
        filename: 'episode-1.mkv',
        sequence_number: 1,
      },
    ];

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(createResponse(episodes))
      .mockResolvedValueOnce(createResponse(episodes[0]));

    await expect(showService.listEpisodes(10)).resolves.toEqual(episodes);
    await expect(showService.getEpisode(21)).resolves.toEqual(episodes[0]);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'show-entries/10/episodes');
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'episodes/21');
  });

  it('creates and updates episodes', async () => {
    const createRequest: CreateEpisodeRequest = {
      name: 'Episode 2',
      filename: 'episode-2.mkv',
      sequence_number: 2,
    };
    const updateRequest: UpdateEpisodeRequest = {
      name: 'Episode 2 Director Cut',
      filename: 'episode-2-director-cut.mkv',
      sequence_number: 2,
    };
    const createdEpisode: Episode = {
      id: 22,
      show_entry_id: 10,
      name: 'Episode 2',
      filename: 'episode-2.mkv',
      sequence_number: 2,
    };
    const updatedEpisode: Episode = {
      id: 22,
      show_entry_id: 10,
      name: 'Episode 2 Director Cut',
      filename: 'episode-2-director-cut.mkv',
      sequence_number: 2,
    };

    vi.mocked(apiClient.post).mockResolvedValue(createResponse(createdEpisode));
    vi.mocked(apiClient.put).mockResolvedValue(createResponse(updatedEpisode));

    await expect(showService.createEpisode(10, createRequest)).resolves.toEqual(createdEpisode);
    await expect(showService.updateEpisode(22, updateRequest)).resolves.toEqual(updatedEpisode);

    expect(apiClient.post).toHaveBeenCalledWith('show-entries/10/episodes', createRequest);
    expect(apiClient.put).toHaveBeenCalledWith('episodes/22', updateRequest);
  });

  it('deletes episodes', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(showService.deleteEpisode(24)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('episodes/24');
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

    await expect(showService.listLinks(4)).resolves.toEqual(links);
    await expect(showService.getLink(30)).resolves.toEqual(links[0]);

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

    await expect(showService.createLink(4, createRequest)).resolves.toEqual(createdLink);
    await expect(showService.updateLink(31, updateRequest)).resolves.toEqual(updatedLink);

    expect(apiClient.post).toHaveBeenCalledWith('shows/4/links', createRequest);
    expect(apiClient.put).toHaveBeenCalledWith('links/31', updateRequest);
  });

  it('deletes show links', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(showService.deleteLink(40)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('links/40');
  });
});
