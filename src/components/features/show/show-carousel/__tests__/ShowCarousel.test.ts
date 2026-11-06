import type { Show } from '@/interfaces/api/models/Show';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createVuetify } from 'vuetify';

import { ShowCard } from '@/components/features/show/show-card';
import ShowCarousel from '../ShowCarousel.vue';

/**
 * Creates a minimal show for a carousel card.
 *
 * @param id The show's id.
 * @returns The show.
 */
const createShow = (id: number) =>
  ({ id, titles: [], entries: [], card_image_url: '', banner_url: '', preview_url: null }) as unknown as Show;

describe('ShowCarousel', () => {
  it('shows the loader only on the starting show', () => {
    const wrapper = mount(ShowCarousel, {
      props: { shows: [createShow(1), createShow(2)], startingShowId: 2 },
      global: { plugins: [createVuetify()] },
    });

    const loadingStates = wrapper.findAllComponents(ShowCard).map((card) => card.props('loading'));

    expect(loadingStates).toEqual([false, true]);
  });
});
