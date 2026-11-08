import type { DashboardStatsResponse } from '@/interfaces/api/responses/DashboardStatsResponse';

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { VCard } from 'vuetify/components';

import DashboardStats from '../DashboardStats.vue';

// The filter definitions load the i18n plugin, which needs the real `createI18n`.
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({ t: (key: string) => key, locale: { value: 'en-US' } }),
}));

const stats: DashboardStatsResponse = {
  shows_count: 10,
  shows_added_last_7_days: 1,
  shows_added_last_30_days: 3,
  episodes_count: 100,
  episodes_missing_video_file_count: 4,
  websites_count: 5,
  users_count: 2,
  video_files_total_bytes: 1024,
  disk_total_bytes: null,
  disk_free_bytes: null,
};

/**
 * Mounts the stats and maps each tile's label to its link.
 * @returns The link of every tile, keyed by its label; undefined for tiles that do not link.
 */
const getTileLinks = (): Record<string, unknown> => {
  const wrapper = mount(DashboardStats, {
    props: { stats },
    global: { plugins: [createVuetify()], stubs: { RouterLink: true } },
  });

  return Object.fromEntries(
    wrapper.findAllComponents(VCard).map((card) => [card.find('.v-card-subtitle').text(), card.props('to')]),
  );
};

describe('DashboardStats', () => {
  it('links the tiles whose admin page can list what they count', () => {
    const links = getTileLinks();

    expect(links['dashboard.shows']).toEqual({ name: 'admin-shows' });
    expect(links['dashboard.missingEpisodeFiles']).toEqual({
      name: 'admin-shows',
      query: { has_missing_video_file: 'true' },
    });
    expect(links['dashboard.websites']).toEqual({ name: 'admin-websites' });
    expect(links['dashboard.users']).toEqual({ name: 'admin-users' });
  });

  it('leaves the tiles without a matching filter plain', () => {
    const links = getTileLinks();

    expect(links['dashboard.added7']).toBeUndefined();
    expect(links['dashboard.added30']).toBeUndefined();
    expect(links['dashboard.episodes']).toBeUndefined();
  });

  it('shows the video files size as a file size, not a byte count', () => {
    const wrapper = mount(DashboardStats, {
      props: { stats },
      global: { plugins: [createVuetify()], stubs: { RouterLink: true } },
    });
    const sizeTile = wrapper
      .findAllComponents(VCard)
      .find((card) => card.find('.v-card-subtitle').text() === 'dashboard.videoFilesSize');

    expect(sizeTile?.find('.v-card-title').text()).toBe('1.0 KB');
  });
});
