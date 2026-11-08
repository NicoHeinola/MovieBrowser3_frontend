import type { Show } from '@/interfaces/api/models/Show';

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createVuetify } from 'vuetify';
import { VImg } from 'vuetify/components';

import StorageTooltip from '../StorageTooltip.vue';

/**
 * Mounts the tooltip with Vuetify.
 * @param props - The tooltip's props.
 * @returns The mounted wrapper.
 */
const mountTooltip = (props: InstanceType<typeof StorageTooltip>['$props']) =>
  mount(StorageTooltip, { props, global: { plugins: [createVuetify()] } });

describe('StorageTooltip', () => {
  it('shows a show with its card image, title, size and share', () => {
    const show = { id: 1, card_image_url: 'https://x/a.jpg' } as Show;
    const wrapper = mountTooltip({ label: '<b>Title</b>', size: '1.0 GB', percent: '5 %', show });

    expect(wrapper.findComponent(VImg).props('src')).toBe('https://x/a.jpg');
    // Titles are text, never markup.
    expect(wrapper.text()).toContain('<b>Title</b>');
    expect(wrapper.text()).toContain('1.0 GB');
    expect(wrapper.text()).toContain('5 %');
  });

  it('shows other slices without an image', () => {
    const wrapper = mountTooltip({ label: 'Free', size: '2.0 GB', percent: '' });

    expect(wrapper.findComponent(VImg).exists()).toBe(false);
    expect(wrapper.text()).toContain('2.0 GB');
  });
});
