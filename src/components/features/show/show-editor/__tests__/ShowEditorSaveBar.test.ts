import type { ShowEditorEpisodeProgress } from '@/interfaces/show/ShowEditorEpisodeProgress';

import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { VProgressCircular } from 'vuetify/components';

import ShowEditorSaveBar from '../ShowEditorSaveBar.vue';

vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'en-US' },
  }),
}));

/**
 * Mounts the save bar in the middle of a save.
 * @param episodeProgress - How far the episode sync is, or null before and after it.
 * @returns The mounted save bar.
 */
const mountSaving = (episodeProgress: ShowEditorEpisodeProgress | null) =>
  mount(ShowEditorSaveBar, {
    props: { isNew: false, hasChanges: true, isSaving: true, isDeleting: false, episodeProgress },
    global: { plugins: [createVuetify()] },
  });

describe('ShowEditorSaveBar', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows episodes and video bytes as done out of all, and fills the ring by bytes', () => {
    const wrapper = mountSaving({ done: 3, total: 13, bytesTotal: 4096, bytesLeft: 1024 });

    expect(wrapper.text()).toContain('3 / 13');
    expect(wrapper.text()).toContain('3.0 / 4.0 KB');
    expect(wrapper.findComponent(VProgressCircular).props()).toMatchObject({ modelValue: 75, indeterminate: false });
  });

  it('leaves out the bytes and fills the ring by episodes when no files upload', () => {
    const wrapper = mountSaving({ done: 1, total: 4, bytesTotal: 0, bytesLeft: 0 });

    expect(wrapper.text()).toContain('1 / 4');
    expect(wrapper.text()).not.toContain(' B');
    expect(wrapper.findComponent(VProgressCircular).props('modelValue')).toBe(25);
  });

  it('spins the ring while the save has no episode progress', () => {
    const wrapper = mountSaving(null);

    expect(wrapper.text()).toContain('showEditor.saving');
    expect(wrapper.text()).not.toContain('/');
    expect(wrapper.findComponent(VProgressCircular).props('indeterminate')).toBe(true);
  });

  it('shows dashes for the time left until the progress first moves, then the estimate', async () => {
    vi.useFakeTimers();
    const wrapper = mountSaving({ done: 0, total: 4, bytesTotal: 0, bytesLeft: 0 });
    expect(wrapper.text()).toContain('–:––');

    // A quarter done in 10 seconds leaves 30 more.
    vi.advanceTimersByTime(10_000);
    await wrapper.setProps({ episodeProgress: { done: 1, total: 4, bytesTotal: 0, bytesLeft: 0 } });
    expect(wrapper.text()).toContain('~0:30');
  });
});
