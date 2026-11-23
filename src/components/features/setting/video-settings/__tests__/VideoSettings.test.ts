import { flushPromises, shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, onMounted, reactive, ref } from 'vue';
import { createVuetify } from 'vuetify';

import { SettingKey } from '@/enums/setting/SettingKey';
import VideoSettings from '../VideoSettings.vue';

const settingStore = reactive({
  hasLoaded: true,
  values: {} as Record<string, string>,
  getSetting: (key: string): string | undefined => settingStore.values[key],
  updateSetting: vi.fn(),
});
const isRelocating = ref<boolean>(false);
const startRelocation = vi.fn();
const showDialog = vi.fn();
const snackbar = { showAPIErrorSnackbar: vi.fn(), showSuccessSnackbar: vi.fn() };

vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/stores/setting/useSettingStore', () => ({ useSettingStore: () => settingStore }));
vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({ useCommonSnackbar: () => snackbar }));
vi.mock('@/components/layouts/dialog-provider', () => ({ useDialog: () => ({ showDialog }) }));

vi.mock('@/composables/setting/useVideoRelocation', () => ({
  useVideoRelocation: () => ({
    isRunning: isRelocating,
    isStarting: ref(false),
    startRelocation,
    statusCard: computed(() => null),
  }),
}));

/** A form that is always valid and submits on its native submit event. */
const BaseFormStub = {
  emits: ['submit', 'update:isValid'],
  setup: (_props: object, { emit }: { emit: (event: string, value?: unknown) => void }) => {
    onMounted(() => emit('update:isValid', true));
  },
  template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>',
};

const VTextFieldStub = {
  props: ['modelValue', 'label'],
  emits: ['update:modelValue'],
  template: '<input :name="label" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
};

/**
 * Mounts the settings, types the given paths and submits the form.
 * @param paths - The paths to type; the ones left out keep their saved value.
 * @returns Nothing.
 */
const submitPaths = async (paths: { folder?: string; vlc?: string }): Promise<void> => {
  const wrapper = shallowMount(VideoSettings, {
    global: {
      plugins: [createVuetify()],
      renderStubDefaultSlot: true,
      stubs: { BaseForm: BaseFormStub, VTextField: VTextFieldStub },
    },
  });

  await flushPromises();

  if (paths.folder !== undefined) {
    await wrapper.find('[name="settings.videoBasePath"]').setValue(paths.folder);
  }

  if (paths.vlc !== undefined) {
    await wrapper.find('[name="settings.vlcPath"]').setValue(paths.vlc);
  }

  await wrapper.find('form').trigger('submit');
  await flushPromises();
};

describe('VideoSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    isRelocating.value = false;
    settingStore.values = { [SettingKey.VideoBasePath]: '/old', [SettingKey.VlcMediaPlayerPath]: '/vlc' };
  });

  it('saves nothing without a change', async () => {
    await submitPaths({});

    expect(settingStore.updateSetting).not.toHaveBeenCalled();
    expect(startRelocation).not.toHaveBeenCalled();
  });

  it('saves only the VLC path when only it changed', async () => {
    await submitPaths({ vlc: '/new-vlc' });

    expect(settingStore.updateSetting).toHaveBeenCalledWith(SettingKey.VlcMediaPlayerPath, '/new-vlc');
    expect(showDialog).not.toHaveBeenCalled();
    expect(startRelocation).not.toHaveBeenCalled();
  });

  it('saves the VLC path and moves the videos when both changed', async () => {
    showDialog.mockResolvedValue(true);

    await submitPaths({ folder: '/new', vlc: '/new-vlc' });

    expect(settingStore.updateSetting).toHaveBeenCalledOnce();
    expect(startRelocation).toHaveBeenCalledWith('/new');
  });

  it('keeps the VLC path saved when the move is turned down', async () => {
    showDialog.mockResolvedValue(false);

    await submitPaths({ folder: '/new', vlc: '/new-vlc' });

    expect(settingStore.updateSetting).toHaveBeenCalledOnce();
    expect(startRelocation).not.toHaveBeenCalled();
  });

  it('moves nothing when the VLC path fails to save', async () => {
    const error = new Error('failed');
    settingStore.updateSetting.mockRejectedValue(error);

    await submitPaths({ folder: '/new', vlc: '/new-vlc' });

    expect(snackbar.showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(showDialog).not.toHaveBeenCalled();
    expect(startRelocation).not.toHaveBeenCalled();
  });

  it('starts no second move while one runs, but still saves the VLC path', async () => {
    isRelocating.value = true;

    await submitPaths({ folder: '/new', vlc: '/new-vlc' });

    expect(settingStore.updateSetting).toHaveBeenCalledOnce();
    expect(startRelocation).not.toHaveBeenCalled();
  });

  it('saves a first folder without asking', async () => {
    settingStore.values = {};

    await submitPaths({ folder: '/new' });

    expect(showDialog).not.toHaveBeenCalled();
    expect(startRelocation).toHaveBeenCalledWith('/new');
  });
});
