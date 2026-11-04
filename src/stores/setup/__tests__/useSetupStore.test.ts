import type { SetupStatus } from '@/interfaces/api/models/SetupStatus';

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SetupCheckCode } from '@/enums/setup/SetupCheckCode';
import { settingService } from '@/services/setting/settingService';
import { setupService } from '@/services/setup/setupService';
import { useSettingStore } from '@/stores/setting/useSettingStore';

import { useSetupStore } from '../useSetupStore';

vi.mock('@/services/setup/setupService', () => ({
  setupService: {
    get: vi.fn(),
    check: vi.fn(),
    complete: vi.fn(),
  },
}));

vi.mock('@/services/setting/settingService', () => ({
  settingService: {
    list: vi.fn(),
    update: vi.fn(),
  },
}));

const createStatus = (completedAt: string | null): SetupStatus => ({
  completed_at: completedAt,
  media_folders: [],
  detected_vlc_media_player_path: null,
});

describe('useSetupStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  describe('isSetupDue', () => {
    it('is due while setup has not been completed', async () => {
      vi.mocked(setupService.get).mockResolvedValue(createStatus(null));

      await expect(useSetupStore().isSetupDue()).resolves.toBe(true);
    });

    it('is not due once setup has been completed', async () => {
      vi.mocked(setupService.get).mockResolvedValue(createStatus('2026-11-01T12:00:00.000000Z'));

      await expect(useSetupStore().isSetupDue()).resolves.toBe(false);
    });

    it('loads the status only once across navigations', async () => {
      vi.mocked(setupService.get).mockResolvedValue(createStatus(null));
      const setupStore = useSetupStore();

      await setupStore.isSetupDue();
      await setupStore.isSetupDue();

      expect(setupService.get).toHaveBeenCalledTimes(1);
    });

    it('is not due after skipping, without asking the backend', async () => {
      const setupStore = useSetupStore();

      setupStore.skip();

      await expect(setupStore.isSetupDue()).resolves.toBe(false);
      expect(setupService.get).not.toHaveBeenCalled();
    });

    it('passes a failed status request on to the caller', async () => {
      vi.mocked(setupService.get).mockRejectedValue(new Error('Network Error'));
      const setupStore = useSetupStore();

      await expect(setupStore.isSetupDue()).rejects.toThrow('Network Error');
      expect(setupStore.isLoading).toBe(false);
    });
  });

  describe('checkAndSavePath', () => {
    const PATH = '/mnt/g/New_Vid';

    beforeEach(() => {
      vi.mocked(settingService.list).mockResolvedValue({ data: [] } as never);
    });

    it('saves a path that passes its check', async () => {
      const result = { ok: true, code: null, params: {} };

      vi.mocked(setupService.check).mockResolvedValue({ video_base_path: result });

      await expect(useSetupStore().checkAndSavePath('video_base_path', PATH)).resolves.toEqual(result);
      expect(setupService.check).toHaveBeenCalledWith({ video_base_path: PATH });
      expect(settingService.update).toHaveBeenCalledWith('video_base_path', { value: PATH });
    });

    it('never saves a path that fails its check', async () => {
      const result = { ok: false, code: SetupCheckCode.PathNotAbsolute, params: {} };

      vi.mocked(setupService.check).mockResolvedValue({ video_base_path: result });

      await expect(useSetupStore().checkAndSavePath('video_base_path', String.raw`G:\Videos`)).resolves.toEqual(result);
      expect(settingService.update).not.toHaveBeenCalled();
    });

    it('does not save a path that has not changed', async () => {
      vi.mocked(setupService.check).mockResolvedValue({ video_base_path: { ok: true, code: null, params: {} } });
      useSettingStore().settings = {
        video_base_path: { key: 'video_base_path', value: PATH, type: 'string' },
      } as never;

      await useSetupStore().checkAndSavePath('video_base_path', PATH);

      expect(settingService.update).not.toHaveBeenCalled();
    });

    it('passes a failed check request on to the caller, without saving', async () => {
      vi.mocked(setupService.check).mockRejectedValue(new Error('Network Error'));

      await expect(useSetupStore().checkAndSavePath('video_base_path', PATH)).rejects.toThrow('Network Error');
      expect(settingService.update).not.toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('stores the completed status, so setup is no longer due', async () => {
      vi.mocked(setupService.get).mockResolvedValue(createStatus(null));
      vi.mocked(setupService.complete).mockResolvedValue(createStatus('2026-11-01T12:00:00.000000Z'));
      const setupStore = useSetupStore();

      await setupStore.isSetupDue();
      await setupStore.complete();

      expect(setupStore.isCompleted).toBe(true);
      await expect(setupStore.isSetupDue()).resolves.toBe(false);
    });
  });
});
