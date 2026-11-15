import type { Backup } from '@/interfaces/api/models/Backup';

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';

import { BackupTable } from '@/components/features/backup/backup-table';
import { backupService } from '@/services/backup/backupService';
import SettingsView from '../SettingsView.vue';

const snackbar = vi.hoisted(() => ({ showAPIErrorSnackbar: vi.fn(), showSuccessSnackbar: vi.fn() }));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => snackbar,
}));

vi.mock('@/components/layouts/dialog-provider', () => ({
  useDialog: () => ({ showDialog: vi.fn() }),
}));

vi.mock('@/composables/dialog/useConfirmDialog', () => ({
  useConfirmDialog: () => ({ confirm: vi.fn() }),
}));

vi.mock('@/composables/setting/useVideoFileCheck', () => ({
  useVideoFileCheck: () => ({
    isPending: ref(false),
    isRunning: ref(false),
    isStarting: ref(false),
    startCheck: vi.fn(),
    statusCard: computed(() => ({ type: 'info', icon: 'mdi-file-search-outline', title: '' })),
  }),
}));

vi.mock('@/stores/setting/useSettingStore', () => ({
  useSettingStore: () => ({
    isLoading: false,
    bannerDefaultBackgrounds: [],
    bannerDefaultVideos: [],
    reloadSettings: vi.fn(),
  }),
}));

vi.mock('@/services/backup/backupService', () => ({
  backupService: { list: vi.fn(), create: vi.fn() },
}));

const older: Backup = {
  name: 'moviebrowser3-20261115-030000.dump',
  size: 1_234_567,
  created_at: '2026-11-15T03:00:00Z',
};
const newer: Backup = {
  name: 'moviebrowser3-20261115-200000.dump',
  size: 1_234_567,
  created_at: '2026-11-15T20:00:00Z',
};

/** Renders both slots of each section, so the backup table and its "Back up now" button are in the page. */
const TitledSectionStub = {
  props: ['title'],
  template: '<section :data-title="title"><slot /><slot name="append" /></section>',
};

/**
 * Mounts the page and waits for its first requests.
 * @returns The mounted page.
 */
const mountPage = async () => {
  const wrapper = shallowMount(SettingsView, {
    global: {
      plugins: [
        createVuetify(),
        createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false }),
        [VueQueryPlugin, { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) }],
      ],
      stubs: { TitledSection: TitledSectionStub },
      renderStubDefaultSlot: true,
    },
  });

  await flushPromises();

  return wrapper;
};

/**
 * Clicks "Back up now" and waits for the backup and the reload.
 * @param wrapper - The mounted page.
 * @returns Nothing.
 */
const clickBackUpNow = async (wrapper: Awaited<ReturnType<typeof mountPage>>): Promise<void> => {
  const section = wrapper.find('[data-title="backup.section"]');
  const button = section.findAll('v-btn-stub').find((candidate) => candidate.text().includes('backup.backUpNow'));

  await button!.trigger('click');
  await flushPromises();
};

describe('SettingsView backups', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(backupService.list).mockResolvedValue({ data: [older] });
  });

  it('lists the backups', async () => {
    const wrapper = await mountPage();

    expect(wrapper.findComponent(BackupTable).props('backups')).toEqual([older]);
  });

  it('backs up, says so and shows the new backup', async () => {
    const wrapper = await mountPage();
    vi.mocked(backupService.create).mockResolvedValue(newer);
    vi.mocked(backupService.list).mockResolvedValue({ data: [newer, older] });

    await clickBackUpNow(wrapper);

    expect(backupService.create).toHaveBeenCalledOnce();
    expect(snackbar.showSuccessSnackbar).toHaveBeenCalledWith('backup.finished');
    expect(wrapper.findComponent(BackupTable).props('backups')).toEqual([newer, older]);
  });

  it('says why backing up failed and keeps the list', async () => {
    const wrapper = await mountPage();
    const error = new Error('backup_dir_unavailable');
    vi.mocked(backupService.create).mockRejectedValue(error);

    await clickBackUpNow(wrapper);

    expect(snackbar.showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(snackbar.showSuccessSnackbar).not.toHaveBeenCalled();
    expect(backupService.list).toHaveBeenCalledOnce();
  });
});
