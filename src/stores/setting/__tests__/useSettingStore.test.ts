import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { settingService } from '@/services/setting/settingService';

import { useSettingStore } from '../useSettingStore';

vi.mock('@/services/setting/settingService', () => ({
  settingService: {
    getSettings: vi.fn(),
    updateSetting: vi.fn(),
  },
}));

vi.mock('@/plugins/query', () => ({
  queryClient: {
    ensureQueryData: vi.fn((opts: { queryFn: () => unknown }) => opts.queryFn()),
    resetQueries: vi.fn(),
  },
}));

describe('useSettingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  it('refreshes banner videos from the backend after adding a trimmed URL', async () => {
    const settingStore = useSettingStore();
    const refreshedSettings = {
      banner_default_videos: {
        key: 'banner_default_videos',
        value: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        type: 'json',
        updated_at: null,
      },
    };

    vi.mocked(settingService.updateSetting).mockResolvedValue();
    vi.mocked(settingService.getSettings).mockResolvedValue(refreshedSettings);

    await settingStore.addBannerDefaultVideo(' https://www.youtube.com/watch?v=dQw4w9WgXcQ ');

    expect(settingStore.bannerDefaultVideos).toEqual(['https://www.youtube.com/watch?v=dQw4w9WgXcQ']);
    expect(settingStore.settings).toEqual(refreshedSettings);
    expect(settingService.updateSetting).toHaveBeenCalledWith('banner_default_videos', {
      value: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    });
    expect(settingService.getSettings).toHaveBeenCalledTimes(1);
  });

  it('refreshes banner backgrounds from the backend after adding a trimmed URL', async () => {
    const settingStore = useSettingStore();
    const refreshedSettings = {
      banner_default_backgrounds: {
        key: 'banner_default_backgrounds',
        value: ['https://images.example.com/background-1.jpg'],
        type: 'json',
        updated_at: null,
      },
    };

    vi.mocked(settingService.updateSetting).mockResolvedValue();
    vi.mocked(settingService.getSettings).mockResolvedValue(refreshedSettings);

    await settingStore.addBannerDefaultBackground(' https://images.example.com/background-1.jpg ');

    expect(settingStore.bannerDefaultBackgrounds).toEqual(['https://images.example.com/background-1.jpg']);
    expect(settingStore.settings).toEqual(refreshedSettings);
    expect(settingService.updateSetting).toHaveBeenCalledWith('banner_default_backgrounds', {
      value: ['https://images.example.com/background-1.jpg'],
    });
    expect(settingService.getSettings).toHaveBeenCalledTimes(1);
  });

  it('appends a trimmed banner background URL before refreshing settings', async () => {
    const settingStore = useSettingStore();
    const refreshedSettings = {
      banner_default_backgrounds: {
        key: 'banner_default_backgrounds',
        value: ['https://images.example.com/background-1.jpg', 'https://images.example.com/background-2.jpg'],
        type: 'json',
        updated_at: null,
      },
    };

    vi.mocked(settingService.updateSetting).mockResolvedValue();
    vi.mocked(settingService.getSettings).mockResolvedValue(refreshedSettings);

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
    expect(settingStore.settings).toEqual(refreshedSettings);
    expect(settingService.updateSetting).toHaveBeenCalledWith('banner_default_backgrounds', {
      value: ['https://images.example.com/background-1.jpg', 'https://images.example.com/background-2.jpg'],
    });
    expect(settingService.getSettings).toHaveBeenCalledTimes(1);
  });

  it('removes a banner video URL before refreshing settings', async () => {
    const settingStore = useSettingStore();
    const refreshedSettings = {
      banner_default_videos: {
        key: 'banner_default_videos',
        value: ['https://www.youtube.com/watch?v=oHg5SJYRHA0'],
        type: 'json',
        updated_at: null,
      },
    };

    vi.mocked(settingService.updateSetting).mockResolvedValue();
    vi.mocked(settingService.getSettings).mockResolvedValue(refreshedSettings);

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
    expect(settingStore.settings).toEqual(refreshedSettings);
    expect(settingService.updateSetting).toHaveBeenCalledWith('banner_default_videos', {
      value: ['https://www.youtube.com/watch?v=oHg5SJYRHA0'],
    });
    expect(settingService.getSettings).toHaveBeenCalledTimes(1);
  });

  it('removes a banner background URL before refreshing settings', async () => {
    const settingStore = useSettingStore();
    const refreshedSettings = {
      banner_default_backgrounds: {
        key: 'banner_default_backgrounds',
        value: ['https://images.example.com/background-2.jpg'],
        type: 'json',
        updated_at: null,
      },
    };

    vi.mocked(settingService.updateSetting).mockResolvedValue();
    vi.mocked(settingService.getSettings).mockResolvedValue(refreshedSettings);

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
    expect(settingStore.settings).toEqual(refreshedSettings);
    expect(settingService.updateSetting).toHaveBeenCalledWith('banner_default_backgrounds', {
      value: ['https://images.example.com/background-2.jpg'],
    });
    expect(settingService.getSettings).toHaveBeenCalledTimes(1);
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

    expect(settingService.updateSetting).not.toHaveBeenCalled();
    expect(settingService.getSettings).not.toHaveBeenCalled();
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

    expect(settingService.updateSetting).not.toHaveBeenCalled();
    expect(settingService.getSettings).not.toHaveBeenCalled();
  });
});
