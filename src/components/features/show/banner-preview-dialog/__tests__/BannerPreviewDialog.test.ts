import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { createVuetify } from 'vuetify';
import { VSwitch } from 'vuetify/components';

import { MediaBanner } from '@/components/common/media-banner';
import { LatestShowsPanel } from '@/components/features/show/latest-shows-panel';
import BannerPreviewDialog from '../BannerPreviewDialog.vue';

// Only useI18n is replaced: the imports below reach the real i18n plugin, which needs the rest of the package.
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock('@/composables/api/useAPIQuery', () => ({
  useAPIQuery: () => ({ data: ref([]), isLoading: ref(false) }),
}));

/**
 * Mounts the dialog with its content rendered in place.
 * @param close - The dialog's close function.
 * @returns The mounted dialog.
 */
const mountDialog = (close: () => void = vi.fn()) =>
  mount(BannerPreviewDialog, {
    props: { close, imageSrc: 'a.jpg', modelValue: true, videoSrc: 'video' },
    global: {
      plugins: [createVuetify()],
      stubs: {
        LatestShowsPanel: true,
        MediaBanner: { props: ['imageSrc', 'videoSrc'], template: '<div><slot /></div>' },
        VDialog: { template: '<div><slot /></div>' },
      },
    },
  });

describe('BannerPreviewDialog', () => {
  it('passes the media to the banner', () => {
    const banner = mountDialog().findComponent(MediaBanner);

    expect(banner.props()).toMatchObject({ imageSrc: 'a.jpg', videoSrc: 'video' });
  });

  it('closes from the close button', async () => {
    const close = vi.fn();

    await mountDialog(close).find('button').trigger('click');

    expect(close).toHaveBeenCalledOnce();
  });

  it('starts with everything that covers the banner on the home page', () => {
    const wrapper = mountDialog();

    expect(wrapper.findComponent(LatestShowsPanel).exists()).toBe(true);
    expect(wrapper.find('.top-0.left-0').exists()).toBe(true);
  });

  it('hides the latest shows', async () => {
    const wrapper = mountDialog();

    await wrapper.findAllComponents(VSwitch)[0]!.setValue(false);

    expect(wrapper.findComponent(LatestShowsPanel).exists()).toBe(false);
    expect(wrapper.find('.top-0.left-0').exists()).toBe(true);
  });

  it('hides the navigation bar', async () => {
    const wrapper = mountDialog();

    await wrapper.findAllComponents(VSwitch)[1]!.setValue(false);

    expect(wrapper.find('.top-0.left-0').exists()).toBe(false);
    expect(wrapper.findComponent(LatestShowsPanel).exists()).toBe(true);
  });
});
