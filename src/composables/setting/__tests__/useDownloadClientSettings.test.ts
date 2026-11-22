import type { Setting } from '@/interfaces/api/models/Setting';

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { useDownloadClientSettings } from '@/composables/setting/useDownloadClientSettings';
import { SettingKey } from '@/enums/setting/SettingKey';
import { SetupCheckCode } from '@/enums/setup/SetupCheckCode';
import { settingService } from '@/services/setting/settingService';
import { setupService } from '@/services/setup/setupService';
import { useSettingStore } from '@/stores/setting/useSettingStore';

vi.mock('@/services/setup/setupService', () => ({
  setupService: { get: vi.fn(), check: vi.fn(), complete: vi.fn() },
}));

vi.mock('@/services/setting/settingService', () => ({
  settingService: { list: vi.fn(), update: vi.fn() },
}));

vi.mock('@/plugins/query', () => ({
  queryClient: { query: vi.fn((options: { queryFn: () => unknown }) => options.queryFn()), resetQueries: vi.fn() },
}));

const PASSED = { ok: true, code: null, params: {} };

/**
 * A loaded setting row.
 * @param key - The setting.
 * @param value - Its value.
 * @param type - Its type.
 * @returns The row.
 */
const setting = (key: SettingKey, value: unknown, type = 'string'): Setting => ({ key, value, type, updated_at: null });

describe('useDownloadClientSettings', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
    vi.mocked(settingService.update).mockResolvedValue();
    vi.mocked(settingService.list).mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 1000, total: 0 },
    });
    useSettingStore().settings = {
      [SettingKey.QBittorrentUrl]: setting(SettingKey.QBittorrentUrl, 'http://127.0.0.1:8080'),
      [SettingKey.QBittorrentUsername]: setting(SettingKey.QBittorrentUsername, 'admin'),
      [SettingKey.QBittorrentPassword]: { ...setting(SettingKey.QBittorrentPassword, null, 'secret'), is_set: true },
      [SettingKey.DownloadPath]: setting(SettingKey.DownloadPath, '/mnt/d/Downloads'),
    };
  });

  it('starts from the saved values, without the password', () => {
    const { request, isPasswordSaved } = useDownloadClientSettings();

    expect(request.value).toEqual({
      url: 'http://127.0.0.1:8080',
      username: 'admin',
      password: '',
      downloadPath: '/mnt/d/Downloads',
    });
    expect(isPasswordSaved.value).toBe(true);
  });

  it('checks with the saved password and saves only what changed', async () => {
    vi.mocked(setupService.check).mockResolvedValue({ qbittorrent_url: PASSED, download_path: PASSED });
    const { request, save } = useDownloadClientSettings();

    request.value.downloadPath = ' /mnt/d/MovieBrowser3 ';

    await expect(save()).resolves.toBe(true);
    expect(setupService.check).toHaveBeenCalledWith({
      qbittorrent_url: 'http://127.0.0.1:8080',
      qbittorrent_username: 'admin',
      download_path: '/mnt/d/MovieBrowser3',
    });
    expect(vi.mocked(settingService.update).mock.calls).toEqual([
      [SettingKey.DownloadPath, { value: '/mnt/d/MovieBrowser3' }],
    ]);
  });

  it('sends and saves a typed password, then forgets it', async () => {
    vi.mocked(setupService.check).mockResolvedValue({ qbittorrent_url: PASSED, download_path: PASSED });
    const { request, save } = useDownloadClientSettings();

    request.value.password = 'new-secret';

    await save();

    expect(setupService.check).toHaveBeenCalledWith(expect.objectContaining({ qbittorrent_password: 'new-secret' }));
    expect(settingService.update).toHaveBeenCalledWith(SettingKey.QBittorrentPassword, { value: 'new-secret' });
    expect(request.value.password).toBe('');
  });

  it('saves nothing and keeps the reason when a check fails, until that value is edited', async () => {
    const failed = { ok: false, code: SetupCheckCode.QBittorrentLoginFailed, params: {} };
    vi.mocked(setupService.check).mockResolvedValue({ qbittorrent_url: failed, download_path: PASSED });
    const { checks, request, save } = useDownloadClientSettings();

    request.value.username = 'other';

    await expect(save()).resolves.toBe(false);
    expect(settingService.update).not.toHaveBeenCalled();
    expect(checks.value.qbittorrent_url).toEqual(failed);

    request.value.password = 'typo-fixed';
    await nextTick();

    expect(checks.value.qbittorrent_url).toBeUndefined();
    expect(checks.value.download_path).toEqual(PASSED);
  });

  it('turns downloads off without checking when the address is emptied', async () => {
    const { request, save } = useDownloadClientSettings();

    request.value.url = '';

    await expect(save()).resolves.toBe(true);
    expect(setupService.check).not.toHaveBeenCalled();
    expect(vi.mocked(settingService.update).mock.calls).toEqual([[SettingKey.QBittorrentUrl, { value: '' }]]);
  });
});
