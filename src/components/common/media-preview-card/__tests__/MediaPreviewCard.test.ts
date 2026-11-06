import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { VCard } from 'vuetify/components';

import MediaPreviewCard from '../MediaPreviewCard.vue';

const showBannerPreview = vi.fn();

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock('@/composables/dialog/useBannerPreviewDialog', () => ({
  useBannerPreviewDialog: () => ({ showBannerPreview }),
}));

// VImg polls on a timer that only unmounting clears, and it would otherwise fire after jsdom is torn down.
enableAutoUnmount(afterEach);

const video = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

/**
 * Mounts the card.
 * @param props - The card's props, on top of the required placeholder text.
 * @returns The mounted card.
 */
const mountCard = (props: { disablePreview?: boolean; imageSrc?: string | null; videoSrc?: string | null }) =>
  mount(MediaPreviewCard, {
    props: { placeholderText: 'empty', ...props },
    slots: { default: '<input />' },
    global: { directives: { tooltip: {} }, plugins: [createVuetify()] },
  });

describe('MediaPreviewCard', () => {
  beforeEach(() => {
    showBannerPreview.mockClear();
  });

  it('shows the image', () => {
    const wrapper = mountCard({ imageSrc: 'a.jpg' });

    expect(wrapper.findComponent(VCard).props('image')).toBe('a.jpg');
  });

  it('falls back to the video thumbnail', () => {
    const wrapper = mountCard({ videoSrc: video });

    expect(wrapper.findComponent(VCard).props('image')).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg');
  });

  it('renders its field on the card', () => {
    expect(mountCard({}).find('.v-card-actions input').exists()).toBe(true);
  });

  it('opens the preview with an image', async () => {
    const wrapper = mountCard({ imageSrc: 'a.jpg' });

    await wrapper.find('button').trigger('click');

    expect(showBannerPreview).toHaveBeenCalledWith({ imageSrc: 'a.jpg', videoSrc: null });
  });

  it('opens the preview with a video', async () => {
    const wrapper = mountCard({ videoSrc: video });

    await wrapper.find('button').trigger('click');

    expect(showBannerPreview).toHaveBeenCalledWith({ imageSrc: null, videoSrc: video });
  });

  it('shows the placeholder and cannot preview without media', () => {
    const wrapper = mountCard({ imageSrc: null, videoSrc: 'not a video' });
    const button = wrapper.find('button');

    expect(wrapper.text()).toContain('empty');
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.element.style.cursor).toBe('default');
  });

  it('cannot preview when the preview is turned off', () => {
    const wrapper = mountCard({ disablePreview: true, imageSrc: 'a.jpg' });
    const button = wrapper.find('button');

    expect(button.attributes('disabled')).toBeDefined();
    expect(button.element.style.cursor).toBe('default');
  });

  it('shows a clickable cursor when it can preview', () => {
    const wrapper = mountCard({ videoSrc: video });

    expect(wrapper.find('button').element.style.cursor).toBe('pointer');
  });

  it('marks the media as an image or a video', () => {
    expect(mountCard({ imageSrc: 'a.jpg' }).find('.v-avatar .mdi-image-outline').exists()).toBe(true);
    expect(mountCard({ videoSrc: video }).find('.v-avatar .mdi-youtube').exists()).toBe(true);
    expect(mountCard({}).find('.v-avatar').exists()).toBe(false);
  });

  it('only zooms on hover when it can preview', () => {
    expect(mountCard({ imageSrc: 'a.jpg' }).find('.zoom-on-hover').exists()).toBe(true);
    expect(mountCard({ disablePreview: true, imageSrc: 'a.jpg' }).find('.zoom-on-hover').exists()).toBe(false);
    expect(mountCard({}).find('.zoom-on-hover').exists()).toBe(false);
  });
});
