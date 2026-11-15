import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';

import { SettingKey } from '@/enums/setting/SettingKey';
import { SetupCheckCode } from '@/enums/setup/SetupCheckCode';
import { setupService } from '@/services/setup/setupService';
import { useSettingStore } from '@/stores/setting/useSettingStore';

import SetupPathStep from '../SetupPathStep.vue';

// Only useI18n is replaced: the imports below reach the real i18n plugin, which needs the rest of the package.
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/services/setup/setupService', () => ({
  setupService: { get: vi.fn(), check: vi.fn(), complete: vi.fn() },
}));

const showAPIErrorSnackbar = vi.fn();

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar }),
}));

const SAVED_PATH = '/mnt/g/Videos';

/**
 * Mounts the step with a valid path and its form stubbed, so submitting skips Vuetify's validation.
 * @param path - The path in the field.
 * @param save - The step's save action.
 * @returns The mounted step.
 */
const mountStep = (path: string, save: (path: string) => Promise<void>) =>
  mount(SetupPathStep, {
    props: {
      formId: 'form',
      isValid: true,
      label: 'Path',
      path,
      rules: [],
      save,
      settingKey: SettingKey.VideoBasePath,
    },
    global: {
      plugins: [createVuetify()],
      stubs: { BaseForm: { template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>' } },
    },
  });

describe('SetupPathStep', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
    useSettingStore().settings = {
      video_base_path: { key: 'video_base_path', value: SAVED_PATH, type: 'string', updated_at: null },
    };
  });

  it('saves a changed path that passes its check, then moves on', async () => {
    vi.mocked(setupService.check).mockResolvedValue({ video_base_path: { ok: true, code: null, params: {} } });
    const save = vi.fn().mockResolvedValue(undefined);
    const wrapper = mountStep(' /mnt/h/Videos ', save);

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(save).toHaveBeenCalledWith('/mnt/h/Videos');
    expect(wrapper.emitted('saved')).toHaveLength(1);
  });

  it('moves on without saving a path that has not changed', async () => {
    vi.mocked(setupService.check).mockResolvedValue({ video_base_path: { ok: true, code: null, params: {} } });
    const save = vi.fn();
    const wrapper = mountStep(SAVED_PATH, save);

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(save).not.toHaveBeenCalled();
    expect(wrapper.emitted('saved')).toHaveLength(1);
  });

  it('never saves a path that fails its check, and says why', async () => {
    vi.mocked(setupService.check).mockResolvedValue({
      video_base_path: { ok: false, code: SetupCheckCode.PathNotAbsolute, params: {} },
    });
    const save = vi.fn();
    const wrapper = mountStep(String.raw`G:\Videos`, save);

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(save).not.toHaveBeenCalled();
    expect(wrapper.emitted('saved')).toBeUndefined();
    expect(wrapper.text()).toContain('setup.checkCodes.path_not_absolute');
  });

  it('stays on the step and shows the error when the save is turned down', async () => {
    vi.mocked(setupService.check).mockResolvedValue({ video_base_path: { ok: true, code: null, params: {} } });
    const error = new Error('busy');
    const wrapper = mountStep('/mnt/h/Videos', vi.fn().mockRejectedValue(error));

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(wrapper.emitted('saved')).toBeUndefined();
  });
});
