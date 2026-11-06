import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';

import { MediaPreviewCard } from '@/components/common/media-preview-card';
import DefaultMediaGallery from '../DefaultMediaGallery.vue';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

/**
 * Mounts the gallery with its cards stubbed, rendering their slot.
 * @param props - The gallery's props, on top of the defaults.
 * @returns The mounted gallery.
 */
const mountGallery = (props: { isVideo?: boolean; loading?: boolean; urls?: string[] }) =>
  mount(DefaultMediaGallery, {
    props: { emptyText: 'nothing', loading: false, urls: ['a'], ...props },
    slots: { append: '<button class="action" />' },
    global: {
      plugins: [createVuetify()],
      stubs: { MediaPreviewCard: { props: ['imageSrc', 'videoSrc'], template: '<div><slot /></div>' } },
    },
  });

describe('DefaultMediaGallery', () => {
  it('shows urls as images by default', () => {
    const card = mountGallery({}).findComponent(MediaPreviewCard);

    expect(card.props()).toMatchObject({ imageSrc: 'a', videoSrc: null });
  });

  it('shows urls as videos', () => {
    const card = mountGallery({ isVideo: true }).findComponent(MediaPreviewCard);

    expect(card.props()).toMatchObject({ imageSrc: null, videoSrc: 'a' });
  });

  it('renders the appended content for each url', () => {
    expect(mountGallery({ urls: ['a', 'b'] }).findAll('.action')).toHaveLength(2);
  });

  it('shows the empty text without urls', () => {
    expect(mountGallery({ urls: [] }).text()).toContain('nothing');
  });

  it('shows no cards while loading', () => {
    expect(mountGallery({ loading: true }).findComponent(MediaPreviewCard).exists()).toBe(false);
  });
});
