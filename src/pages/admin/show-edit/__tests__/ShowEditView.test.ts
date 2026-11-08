import type { Show } from '@/interfaces/api/models/Show';
import type { VueWrapper } from '@vue/test-utils';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, ref } from 'vue';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createVuetify } from 'vuetify';

import ShowEditView from '../ShowEditView.vue';

const confirm = vi.fn();
const showWarningSnackbar = vi.fn();
const validate = vi.fn();
/** Mounted pages, unmounted after each test so their window listeners don't answer the next test's keys. */
const wrappers: VueWrapper[] = [];

/** What the mocked show editor hands the page; each test sets the parts it needs. */
const editor = {
  show: ref<Show | null>(null),
  isLoading: ref<boolean>(false),
  isLoadError: ref<boolean>(false),
  isSaving: ref<boolean>(false),
  isDeleting: ref<boolean>(false),
  hasChanges: ref<boolean>(false),
  episodeProgress: ref(null),
  save: vi.fn(),
  remove: vi.fn(),
  discard: vi.fn(),
};

vi.mock('@/composables/show/useShowEditor', () => ({ useShowEditor: () => editor }));
vi.mock('@/composables/dialog/useConfirmDialog', () => ({ useConfirmDialog: () => ({ confirm }) }));
vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({ useCommonSnackbar: () => ({ showWarningSnackbar }) }));

vi.mock('@/components/features/show/show-editor', () => ({
  ShowEditor: defineComponent({
    name: 'ShowEditor',
    setup: (_props, { expose }) => expose({ validate }),
    template: '<div />',
  }),
  ShowEditorHero: { name: 'ShowEditorHero', template: '<div />' },
  ShowEditorSaveBar: { name: 'ShowEditorSaveBar', template: '<div />' },
  ShowEditorSkeleton: { name: 'ShowEditorSkeleton', template: '<div />' },
}));

/**
 * Renders the page through a router, as the app does, so its leave guard is registered.
 * @param path - The URL the page opens at.
 * @returns The router.
 */
const openPage = async (path: string) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/shows', name: 'admin-shows', component: { template: '<div />' } },
      { path: '/admin/shows/new', name: 'admin-show-new', component: ShowEditView },
      { path: String.raw`/admin/shows/:showId(\d+)`, name: 'admin-show-edit', component: ShowEditView },
    ],
  });
  await router.push(path);

  const wrapper = mount(
    { template: '<router-view />' },
    {
      attachTo: document.body,
      global: {
        plugins: [router, createVuetify(), createI18n({ legacy: false, locale: 'en', missingWarn: false })],
        stubs: { PageBackground: true, PageContainer: { template: '<div><slot /></div>' } },
      },
    },
  );
  wrappers.push(wrapper);
  await flushPromises();

  return router;
};

describe('ShowEditView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    editor.show.value = { id: 4, titles: [] } as unknown as Show;
    editor.isSaving.value = false;
    editor.hasChanges.value = false;
    validate.mockResolvedValue(true);
  });

  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) {
      wrapper.unmount();
    }
    document.body.innerHTML = '';
  });

  it('leaves without asking when nothing is unsaved', async () => {
    const router = await openPage('/admin/shows/4');

    await router.push({ name: 'admin-shows' });

    expect(confirm).not.toHaveBeenCalled();
    expect(router.currentRoute.value.name).toBe('admin-shows');
  });

  it('asks before leaving unsaved changes, also while a save is running, and stays when the user says so', async () => {
    const router = await openPage('/admin/shows/4');
    editor.hasChanges.value = true;
    editor.isSaving.value = true;
    confirm.mockResolvedValue(false);

    await router.push({ name: 'admin-shows' });

    expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ message: 'showEditor.leaveConfirm' }));
    expect(router.currentRoute.value.name).toBe('admin-show-edit');
  });

  it('saves on Ctrl+S once every section passes, and not before', async () => {
    await openPage('/admin/shows/4');
    editor.hasChanges.value = true;
    editor.save.mockResolvedValue(4);

    validate.mockResolvedValueOnce(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
    await flushPromises();
    expect(showWarningSnackbar).toHaveBeenCalled();
    expect(editor.save).not.toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'S', metaKey: true }));
    await flushPromises();
    expect(editor.save).toHaveBeenCalledTimes(1);
  });

  it('moves a created show to its own edit URL without asking', async () => {
    const router = await openPage('/admin/shows/new');
    editor.hasChanges.value = true;
    editor.save.mockImplementation(async () => {
      // A successful save reloads the draft, so nothing is unsaved when the URL changes.
      editor.hasChanges.value = false;
      return 42;
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
    await flushPromises();

    expect(confirm).not.toHaveBeenCalled();
    expect(router.currentRoute.value.fullPath).toBe('/admin/shows/42');
  });
});
