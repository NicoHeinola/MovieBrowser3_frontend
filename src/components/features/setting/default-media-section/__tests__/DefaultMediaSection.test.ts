import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';

import { AddDefaultBackgroundDialog } from '@/components/features/setting/add-default-background-dialog';
import { AddDefaultVideoDialog } from '@/components/features/setting/add-default-video-dialog';
import DefaultMediaSection from '../DefaultMediaSection.vue';

const settingStore = {
  hasLoaded: true,
  isLoading: false,
  bannerDefaultVideos: ['video'],
  bannerDefaultBackgrounds: ['background'],
  removeBannerDefaultVideo: vi.fn(),
  removeBannerDefaultBackground: vi.fn(),
};
const confirm = vi.fn();
const showDialog = vi.fn();
const snackbar = { showAPIErrorSnackbar: vi.fn(), showSuccessSnackbar: vi.fn() };

vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/stores/setting/useSettingStore', () => ({ useSettingStore: () => settingStore }));
vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({ useCommonSnackbar: () => snackbar }));
vi.mock('@/composables/dialog/useConfirmDialog', () => ({ useConfirmDialog: () => ({ confirm }) }));
vi.mock('@/components/layouts/dialog-provider', () => ({ useDialog: () => ({ showDialog }) }));

/**
 * Mounts the section with its gallery stubbed, rendering the buttons of its first url.
 * @param isVideo - Whether it holds the videos.
 * @returns The mounted section.
 */
const mountSection = (isVideo: boolean) =>
  mount(DefaultMediaSection, {
    props: { isVideo },
    global: {
      plugins: [createVuetify()],
      stubs: {
        DefaultMediaGallery: {
          props: ['urls'],
          template: '<div class="gallery"><slot :url="urls[0]" name="append" /></div>',
        },
      },
    },
  });

describe('DefaultMediaSection', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each([
    { isVideo: true, url: 'video', remove: settingStore.removeBannerDefaultVideo },
    { isVideo: false, url: 'background', remove: settingStore.removeBannerDefaultBackground },
  ])('removes its own kind after confirming (video: $isVideo)', async ({ isVideo, url, remove }) => {
    confirm.mockResolvedValue(true);

    await mountSection(isVideo).find('.gallery button').trigger('click');
    await flushPromises();

    expect(remove).toHaveBeenCalledWith(url);
    expect(snackbar.showSuccessSnackbar).toHaveBeenCalledOnce();
  });

  it('removes nothing when turned down', async () => {
    confirm.mockResolvedValue(false);

    await mountSection(true).find('.gallery button').trigger('click');
    await flushPromises();

    expect(settingStore.removeBannerDefaultVideo).not.toHaveBeenCalled();
  });

  it.each([
    { isVideo: true, component: AddDefaultVideoDialog },
    { isVideo: false, component: AddDefaultBackgroundDialog },
  ])('adds its own kind (video: $isVideo)', async ({ isVideo, component }) => {
    const buttons = mountSection(isVideo).findAll('button');

    await buttons.find((button) => button.find('.mdi-plus').exists())!.trigger('click');

    expect(showDialog).toHaveBeenCalledWith({ component });
  });
});
