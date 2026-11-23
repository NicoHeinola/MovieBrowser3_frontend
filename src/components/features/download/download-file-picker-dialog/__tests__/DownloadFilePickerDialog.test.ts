import type { Download } from '@/interfaces/api/models/Download';
import type { DownloadFile } from '@/interfaces/api/models/DownloadFile';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { VSelect } from 'vuetify/components';

import DownloadFilePickerDialog from '../DownloadFilePickerDialog.vue';

vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({ t: (key: string) => key, locale: { value: 'en' } }),
}));

/**
 * A torrent file.
 * @param index - Its index in the torrent.
 * @param path - Its path.
 * @returns The file.
 */
const file = (index: number, path: string): DownloadFile => ({
  index,
  path,
  size_bytes: 100,
  progress: 0,
  episode_id: null,
  show_id: null,
  imported_at: null,
});

const first = { download: { id: 1, name: 'First' } as Download, availableFiles: [file(0, 'a.mkv'), file(1, 'a.ass')] };
const second = { download: { id: 2, name: 'Second' } as Download, availableFiles: [file(0, 'b.mkv')] };

/**
 * Mounts the picker with its content rendered in place.
 * @param close - The dialog's close function.
 * @param sources - The torrents to pick from.
 * @returns The mounted dialog.
 */
const mountDialog = (close = vi.fn(), sources = [first, second]) =>
  mount(DownloadFilePickerDialog, {
    props: { close, modelValue: true, sources, targetName: 'Season 1' },
    global: { plugins: [createVuetify()], stubs: { VDialog: { template: '<div><slot /></div>' } } },
  });

/**
 * Clicks the dialog's confirm button, the last one.
 * @param wrapper - The mounted dialog.
 * @returns Nothing.
 */
const confirm = async (wrapper: ReturnType<typeof mountDialog>): Promise<void> => {
  await wrapper.findAll('button').at(-1)!.trigger('click');
};

describe('DownloadFilePickerDialog', () => {
  it('starts on the first torrent with its videos picked', async () => {
    const close = vi.fn();

    await confirm(mountDialog(close));

    expect(close).toHaveBeenCalledWith({ download: first.download, files: [first.availableFiles[0]] });
  });

  it('switches torrents and starts over with the picks of the other one', async () => {
    const close = vi.fn();
    const wrapper = mountDialog(close);

    wrapper.findComponent(VSelect).vm.$emit('update:modelValue', 2);
    await wrapper.vm.$nextTick();
    await confirm(wrapper);

    expect(close).toHaveBeenCalledWith({ download: second.download, files: [second.availableFiles[0]] });
  });

  it('shows no torrent switch for one torrent', () => {
    const wrapper = mountDialog(vi.fn(), [first]);

    expect(wrapper.findComponent(VSelect).exists()).toBe(false);
  });
});
