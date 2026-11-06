import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';

import { MediaBanner } from '@/components/common/media-banner';
import BannerPreviewDialog from '../BannerPreviewDialog.vue';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

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
      stubs: { MediaBanner: true, VDialog: { template: '<div><slot /></div>' } },
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
});
