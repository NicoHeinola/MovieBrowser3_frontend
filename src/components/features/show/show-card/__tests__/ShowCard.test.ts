import type { Show } from '@/interfaces/api/models/Show';

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';

import ShowCard from '../ShowCard.vue';

const show = { id: 1, card_image_url: 'card.jpg', banner_url: 'banner.jpg', preview_url: null } as unknown as Show;

/**
 * Mounts a card without its video player.
 * @returns The mounted card and a spy on its hover event, which unlike `emitted()` survives the unmount.
 */
const mountCard = () => {
  const onHover = vi.fn();
  const wrapper = mount(ShowCard, {
    props: { show, onHover },
    global: { plugins: [createVuetify({ components })], stubs: { YouTubePlayer: true } },
  });

  return { onHover, wrapper };
};

describe('ShowCard', () => {
  it('reports when the pointer enters and leaves', async () => {
    const { onHover, wrapper } = mountCard();

    await wrapper.find('.show-card').trigger('mouseenter');
    await wrapper.find('.show-card').trigger('mouseleave');

    expect(onHover.mock.calls).toEqual([[true], [false]]);
  });

  it('releases the hover when it unmounts while hovered', async () => {
    const { onHover, wrapper } = mountCard();
    await wrapper.find('.show-card').trigger('mouseenter');

    wrapper.unmount();

    expect(onHover.mock.calls).toEqual([[true], [false]]);
  });

  it('reports nothing when it unmounts without being hovered', () => {
    const { onHover, wrapper } = mountCard();

    wrapper.unmount();

    expect(onHover).not.toHaveBeenCalled();
  });
});
