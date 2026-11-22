import type { SettingsResponse } from '@/interfaces/api/responses/SettingsResponse';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingKey } from '@/enums/setting/SettingKey';
import { settingService } from '@/services/setting/settingService';
import { useSettingStore } from '../useSettingStore';

vi.mock('@/services/setting/settingService', () => ({
  settingService: {
    list: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/plugins/query', () => ({
  queryClient: {
    query: vi.fn((opts: { queryFn: () => unknown }) => opts.queryFn()),
    resetQueries: vi.fn(),
  },
}));

describe('useSettingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  const createSettingsResponse = (values: Record<string, unknown>): SettingsResponse => {
    return {
      data: Object.entries(values).map(([key, value]) => ({
        key,
        value,
        type: 'json',
        updated_at: null,
      })),
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 1000,
        total: Object.keys(values).length,
      },
    };
  };

  it('refreshes banner videos from the backend after adding a trimmed URL', async () => {
    const settingStore = useSettingStore();
    const refreshedSettings = createSettingsResponse({
      banner_default_videos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    });

    vi.mocked(settingService.update).mockResolvedValue();
    vi.mocked(settingService.list).mockResolvedValue(refreshedSettings);

    await settingStore.addBannerDefaultVideo(' https://www.youtube.com/watch?v=dQw4w9WgXcQ ');

    expect(settingStore.bannerDefaultVideos).toEqual(['https://www.youtube.com/watch?v=dQw4w9WgXcQ']);
    expect(settingStore.settings).toEqual({
      banner_default_videos: refreshedSettings.data[0],
    });
    expect(settingService.update).toHaveBeenCalledWith(SettingKey.BannerDefaultVideos, {
      value: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    });
    expect(settingService.list).toHaveBeenCalledTimes(1);
  });

  it('refreshes banner backgrounds from the backend after adding a trimmed URL', async () => {
    const settingStore = useSettingStore();
    const refreshedSettings = createSettingsResponse({
      banner_default_backgrounds: ['https://images.example.com/background-1.jpg'],
    });

    vi.mocked(settingService.update).mockResolvedValue();
    vi.mocked(settingService.list).mockResolvedValue(refreshedSettings);

    await settingStore.addBannerDefaultBackground(' https://images.example.com/background-1.jpg ');

    expect(settingStore.bannerDefaultBackgrounds).toEqual(['https://images.example.com/background-1.jpg']);
    expect(settingStore.settings).toEqual({
      banner_default_backgrounds: refreshedSettings.data[0],
    });
    expect(settingService.update).toHaveBeenCalledWith(SettingKey.BannerDefaultBackgrounds, {
      value: ['https://images.example.com/background-1.jpg'],
    });
    expect(settingService.list).toHaveBeenCalledTimes(1);
  });

  it('appends a trimmed banner background URL before refreshing settings', async () => {
    const settingStore = useSettingStore();
    const refreshedSettings = createSettingsResponse({
      banner_default_backgrounds: [
        'https://images.example.com/background-1.jpg',
        'https://images.example.com/background-2.jpg',
      ],
    });

    vi.mocked(settingService.update).mockResolvedValue();
    vi.mocked(settingService.list).mockResolvedValue(refreshedSettings);

    settingStore.settings = {
      banner_default_backgrounds: {
        key: 'banner_default_backgrounds',
        value: ['https://images.example.com/background-1.jpg'],
        type: 'json',
        updated_at: null,
      },
    };

    await settingStore.addBannerDefaultBackground(' https://images.example.com/background-2.jpg ');

    expect(settingStore.bannerDefaultBackgrounds).toEqual([
      'https://images.example.com/background-1.jpg',
      'https://images.example.com/background-2.jpg',
    ]);
    expect(settingStore.settings).toEqual({
      banner_default_backgrounds: refreshedSettings.data[0],
    });
    expect(settingService.update).toHaveBeenCalledWith(SettingKey.BannerDefaultBackgrounds, {
      value: ['https://images.example.com/background-1.jpg', 'https://images.example.com/background-2.jpg'],
    });
    expect(settingService.list).toHaveBeenCalledTimes(1);
  });

  it('forces a fresh banner background fetch after updating settings', async () => {
    const settingStore = useSettingStore();
    const staleSettings = {
      banner_default_backgrounds: {
        key: 'banner_default_backgrounds',
        value: ['https://images.example.com/background-1.jpg'],
        type: 'json',
        updated_at: null,
      },
    };
    const refreshedSettings = createSettingsResponse({
      banner_default_backgrounds: [
        'https://images.example.com/background-1.jpg',
        'https://images.example.com/background-2.jpg',
      ],
    });

    vi.mocked(settingService.update).mockResolvedValue();
    vi.mocked(settingService.list).mockResolvedValue(refreshedSettings);

    settingStore.settings = staleSettings;

    await settingStore.addBannerDefaultBackground(' https://images.example.com/background-2.jpg ');

    expect(settingStore.bannerDefaultBackgrounds).toEqual([
      'https://images.example.com/background-1.jpg',
      'https://images.example.com/background-2.jpg',
    ]);
  });

  it('removes a banner video URL before refreshing settings', async () => {
    const settingStore = useSettingStore();
    const refreshedSettings = createSettingsResponse({
      banner_default_videos: ['https://www.youtube.com/watch?v=oHg5SJYRHA0'],
    });

    vi.mocked(settingService.update).mockResolvedValue();
    vi.mocked(settingService.list).mockResolvedValue(refreshedSettings);

    settingStore.settings = {
      banner_default_videos: {
        key: 'banner_default_videos',
        value: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=oHg5SJYRHA0'],
        type: 'json',
        updated_at: null,
      },
    };

    await settingStore.removeBannerDefaultVideo(' https://www.youtube.com/watch?v=dQw4w9WgXcQ ');

    expect(settingStore.bannerDefaultVideos).toEqual(['https://www.youtube.com/watch?v=oHg5SJYRHA0']);
    expect(settingStore.settings).toEqual({
      banner_default_videos: refreshedSettings.data[0],
    });
    expect(settingService.update).toHaveBeenCalledWith(SettingKey.BannerDefaultVideos, {
      value: ['https://www.youtube.com/watch?v=oHg5SJYRHA0'],
    });
    expect(settingService.list).toHaveBeenCalledTimes(1);
  });

  it('removes a banner background URL before refreshing settings', async () => {
    const settingStore = useSettingStore();
    const refreshedSettings = createSettingsResponse({
      banner_default_backgrounds: ['https://images.example.com/background-2.jpg'],
    });

    vi.mocked(settingService.update).mockResolvedValue();
    vi.mocked(settingService.list).mockResolvedValue(refreshedSettings);

    settingStore.settings = {
      banner_default_backgrounds: {
        key: 'banner_default_backgrounds',
        value: ['https://images.example.com/background-1.jpg', 'https://images.example.com/background-2.jpg'],
        type: 'json',
        updated_at: null,
      },
    };

    await settingStore.removeBannerDefaultBackground(' https://images.example.com/background-1.jpg ');

    expect(settingStore.bannerDefaultBackgrounds).toEqual(['https://images.example.com/background-2.jpg']);
    expect(settingStore.settings).toEqual({
      banner_default_backgrounds: refreshedSettings.data[0],
    });
    expect(settingService.update).toHaveBeenCalledWith(SettingKey.BannerDefaultBackgrounds, {
      value: ['https://images.example.com/background-2.jpg'],
    });
    expect(settingService.list).toHaveBeenCalledTimes(1);
  });

  it('skips update when removing a background that is not present', async () => {
    const settingStore = useSettingStore();

    settingStore.settings = {
      banner_default_backgrounds: {
        key: 'banner_default_backgrounds',
        value: ['https://images.example.com/background-1.jpg'],
        type: 'json',
        updated_at: null,
      },
    };

    await settingStore.removeBannerDefaultBackground('https://images.example.com/background-2.jpg');

    expect(settingService.update).not.toHaveBeenCalled();
    expect(settingService.list).not.toHaveBeenCalled();
  });

  it('skips update when removing a video that is not present', async () => {
    const settingStore = useSettingStore();

    settingStore.settings = {
      banner_default_videos: {
        key: 'banner_default_videos',
        value: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        type: 'json',
        updated_at: null,
      },
    };

    await settingStore.removeBannerDefaultVideo('https://www.youtube.com/watch?v=oHg5SJYRHA0');

    expect(settingService.update).not.toHaveBeenCalled();
    expect(settingService.list).not.toHaveBeenCalled();
  });
  it('saves several settings one after another and reloads once', async () => {
    const settingStore = useSettingStore();

    vi.mocked(settingService.update).mockResolvedValue();
    vi.mocked(settingService.list).mockResolvedValue(
      createSettingsResponse({ qbittorrent_url: 'http://127.0.0.1:8080', qbittorrent_username: 'admin' }),
    );

    await settingStore.updateSettings({
      [SettingKey.QBittorrentUrl]: 'http://127.0.0.1:8080',
      [SettingKey.QBittorrentUsername]: 'admin',
    });

    expect(vi.mocked(settingService.update).mock.calls).toEqual([
      [SettingKey.QBittorrentUrl, { value: 'http://127.0.0.1:8080' }],
      [SettingKey.QBittorrentUsername, { value: 'admin' }],
    ]);
    expect(settingService.list).toHaveBeenCalledOnce();
    expect(settingStore.getSetting(SettingKey.QBittorrentUsername)).toBe('admin');
  });

  it('stops at the first failed save but still reloads what was saved', async () => {
    const settingStore = useSettingStore();

    vi.mocked(settingService.update).mockResolvedValueOnce().mockRejectedValueOnce(new Error('422'));
    vi.mocked(settingService.list).mockResolvedValue(
      createSettingsResponse({ qbittorrent_url: 'http://127.0.0.1:8080' }),
    );

    await expect(
      settingStore.updateSettings({
        [SettingKey.QBittorrentUrl]: 'http://127.0.0.1:8080',
        [SettingKey.DownloadPath]: '/elsewhere',
        [SettingKey.QBittorrentUsername]: 'admin',
      }),
    ).rejects.toThrow('422');

    expect(settingService.update).toHaveBeenCalledTimes(2);
    expect(settingStore.getSetting(SettingKey.QBittorrentUrl)).toBe('http://127.0.0.1:8080');
  });

  it('tells whether a secret setting is saved without knowing its value', async () => {
    const settingStore = useSettingStore();
    const response = createSettingsResponse({ qbittorrent_password: null });

    response.data[0] = { ...response.data[0]!, type: 'secret', is_set: true };
    vi.mocked(settingService.list).mockResolvedValue(response);

    await settingStore.reloadSettings();

    expect(settingStore.isSettingSet(SettingKey.QBittorrentPassword)).toBe(true);
    expect(settingStore.isSettingSet(SettingKey.DownloadPath)).toBe(false);
  });
});
