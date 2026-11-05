import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createVuetify } from 'vuetify';
import FormItemList from '../FormItemList.vue';

/**
 * Mounts the list with an item and an action in its slots.
 *
 * @param hasItems Whether the list has items.
 * @returns The mounted wrapper.
 */
const mountList = (hasItems: boolean) =>
  mount(FormItemList, {
    props: { hasItems },
    slots: { default: '<p class="item" />', actions: '<button class="action" />' },
    global: { plugins: [createVuetify()] },
  });

describe('FormItemList', () => {
  it('shows the items above the actions', () => {
    const wrapper = mountList(true);

    expect(wrapper.find('.item').isVisible()).toBe(true);
    expect(wrapper.find('.action').isVisible()).toBe(true);
  });

  it('hides the empty items column but keeps its content mounted', () => {
    const wrapper = mountList(false);

    expect(wrapper.find('.item').exists()).toBe(true);
    expect(wrapper.find('.item').element.parentElement?.style.display).toBe('none');
    expect(wrapper.find('.action').isVisible()).toBe(true);
  });
});
