import type { SetupStatus } from '@/interfaces/api/models/SetupStatus';

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupService } from '@/services/setup/setupService';

import { useSetupStore } from '../useSetupStore';

vi.mock('@/services/setup/setupService', () => ({
  setupService: {
    get: vi.fn(),
    check: vi.fn(),
    complete: vi.fn(),
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
