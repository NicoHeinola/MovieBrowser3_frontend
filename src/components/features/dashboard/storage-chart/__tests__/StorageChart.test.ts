import type { StorageShowRow } from '../StorageShowRow';
import type { Show } from '@/interfaces/api/models/Show';
import type { DashboardStatsResponse } from '@/interfaces/api/responses/DashboardStatsResponse';

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { chartPalette } from '@/plugins/vuetify/chartPalette';

import StorageChart from '../StorageChart.vue';

// Something down the import chain loads the i18n plugin, which needs the real `createI18n`.
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({ t: (key: string) => key, locale: { value: 'en-US' } }),
}));

const GB = 1024 ** 3;

const stats: DashboardStatsResponse = {
  shows_count: 0,
  shows_added_last_7_days: 0,
  shows_added_last_30_days: 0,
  episodes_count: 0,
  episodes_missing_video_file_count: 0,
  websites_count: 0,
  users_count: 0,
  video_files_total_bytes: 100 * GB,
  disk_total_bytes: 500 * GB,
  disk_free_bytes: 200 * GB,
};

/**
 * Builds a show whose one episode has the given size.
 * @param id - The show id, also used in its title.
 * @param bytes - The episode's video file size.
 * @returns The show.
 */
const createShow = (id: number, bytes: number): Show =>
  ({
    id,
    card_image_url: `https://x/${id}.jpg`,
    titles: [{ title: `Show ${id}`, is_primary: true }],
    entries: [{ episodes: [{ has_video_file: true, video_file_size: bytes }] }],
  }) as Show;

/**
 * Mounts the chart with the donut stubbed, since ECharts needs a real canvas.
 * @param shows - The shows to pass.
 * @returns The rows handed to the biggest shows list.
 */
const getRows = (shows: Show[]): StorageShowRow[] => {
  const wrapper = mount(StorageChart, {
    props: { stats, shows },
    global: { plugins: [createVuetify()], stubs: { StorageDonut: true } },
  });

  return wrapper.findComponent({ name: 'StorageShowList' }).props('rows') as StorageShowRow[];
};

describe('StorageChart', () => {
  it('colors each row like its arc and shows its share of all videos', () => {
    const rows = getRows([createShow(1, 50 * GB), createShow(2, 25 * GB)]);

    expect(rows.map(({ title, color, size, share }) => [title, color, size, share])).toEqual([
      ['Show 1', chartPalette[0], '50.0 GB', 50],
      ['Show 2', chartPalette[1], '25.0 GB', 25],
    ]);
  });

  it('lists at most six shows', () => {
    const shows = Array.from({ length: 8 }, (_, index) => createShow(index + 1, GB));

    expect(getRows(shows)).toHaveLength(6);
  });

  it('says no sizes are measured when no show has one', () => {
    const wrapper = mount(StorageChart, {
      props: { stats, shows: [createShow(1, 0)] },
      global: { plugins: [createVuetify()], stubs: { StorageDonut: true } },
    });

    expect(wrapper.findComponent({ name: 'StorageShowList' }).exists()).toBe(false);
    expect(wrapper.text()).toContain('dashboard.storageNoSizes');
  });
});
