import type { Show } from '@/interfaces/api/models/Show';
import type { ShowTemplate } from '@/interfaces/api/models/ShowTemplate';
import type { VueWrapper } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, ref } from 'vue';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createVuetify } from 'vuetify';

import ShowEditView from '../ShowEditView.vue';

const confirm = vi.fn();
const showDialog = vi.fn();
const loadTemplate = vi.fn();
const showSuccessSnackbar = vi.fn();
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
  applyTemplate: vi.fn(),
};

/** A template as a nekoBT page gives it, with one genre the app has no category for. */
const template = {
  source_url: 'https://nekobt.to/media/s1453',
  titles: ['Saga of Tanya the Evil'],
  unmatched_genres: ['Military'],
} as unknown as ShowTemplate;

const checkShow = vi.fn();

vi.mock('@/composables/show/useShowEditor', () => ({ useShowEditor: () => editor }));
vi.mock('@/composables/video-file-check/useShowVideoFileCheck', () => ({
  useShowVideoFileCheck: () => ({ isChecking: ref<boolean>(false), checkShow }),
}));
vi.mock('@/composables/dialog/useConfirmDialog', () => ({ useConfirmDialog: () => ({ confirm }) }));
vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showSuccessSnackbar, showWarningSnackbar }),
}));
vi.mock('@/composables/show/useShowTemplate', () => ({
  useShowTemplate: () => ({ isLoading: ref<boolean>(false), loadTemplate }),
}));
vi.mock('@/components/layouts/dialog-provider', () => ({ useDialog: () => ({ showDialog }) }));

vi.mock('@/components/features/show/show-editor', () => ({
  ShowEditor: defineComponent({
    name: 'ShowEditor',
    setup: (_props, { expose }) => expose({ validate }),
    template: '<div />',
  }),
  // Renders its actions, so the page's buttons in them can be clicked
  ShowEditorHero: { name: 'ShowEditorHero', template: '<div><slot name="actions" /></div>' },
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
        plugins: [
          router,
          createVuetify(),
          createI18n({ legacy: false, locale: 'en', missingWarn: false }),
          [VueQueryPlugin, { queryClient: new QueryClient() }],
        ],
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

  it("checks the show's video files from its button", async () => {
    await openPage('/admin/shows/4');

    const button = [...document.querySelectorAll('button')].find((candidate) =>
      candidate.textContent?.includes('showEditor.checkVideoFiles'),
    );
    button?.click();

    expect(checkShow).toHaveBeenCalledWith(4);
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

  describe('templates', () => {
    beforeEach(() => {
      editor.show.value = { titles: [{ title: '', is_primary: true }] } as unknown as Show;
    });

    it('fills a new show in from the link it was opened with, warning about genres without a category', async () => {
      loadTemplate.mockResolvedValue(template);

      await openPage('/admin/shows/new?template=https%3A%2F%2Fnekobt.to%2Fmedia%2Fs1453');

      expect(loadTemplate).toHaveBeenCalledWith('https://nekobt.to/media/s1453');
      expect(editor.applyTemplate).toHaveBeenCalledWith(template);
      expect(showSuccessSnackbar).toHaveBeenCalledWith('showEditor.template.filled');
      expect(showWarningSnackbar).toHaveBeenCalledWith(expect.stringContaining('showEditor.template.unmatchedGenres'));

      // The link dialog starts from the link the show was filled in from
      showDialog.mockResolvedValue(undefined);
      [...document.body.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes('showEditor.template.autofill'))
        ?.click();
      await flushPromises();
      expect(showDialog).toHaveBeenCalledWith(
        expect.objectContaining({ props: { initialUrl: 'https://nekobt.to/media/s1453' } }),
      );
    });

    it("doesn't fill in a template that loads after the user left the page", async () => {
      // The template answers only once the test lets it, after the user has left
      let answer: (value: ShowTemplate) => void = () => {};
      loadTemplate.mockReturnValue(new Promise<ShowTemplate>((resolve) => (answer = resolve)));

      const router = await openPage('/admin/shows/new?template=https%3A%2F%2Fnekobt.to%2Fmedia%2Fs1453');
      await router.push({ name: 'admin-shows' });
      answer(template);
      await flushPromises();

      expect(editor.applyTemplate).not.toHaveBeenCalled();
      expect(showSuccessSnackbar).not.toHaveBeenCalled();
      expect(showWarningSnackbar).not.toHaveBeenCalled();
    });

    it('ignores a template link on an existing show', async () => {
      editor.show.value = { id: 4, titles: [] } as unknown as Show;

      await openPage('/admin/shows/4?template=https%3A%2F%2Fnekobt.to%2Fmedia%2Fs1453');

      expect(loadTemplate).not.toHaveBeenCalled();
      expect(editor.applyTemplate).not.toHaveBeenCalled();
    });

    it('fills a new show in from a link pasted in the dialog, asking before replacing unsaved work', async () => {
      await openPage('/admin/shows/new');
      editor.hasChanges.value = true;
      showDialog.mockResolvedValue(template);
      confirm.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

      const button = [...document.body.querySelectorAll<HTMLButtonElement>('button')].find((candidate) =>
        candidate.textContent?.includes('showEditor.template.autofill'),
      );
      expect(button).toBeDefined();

      button?.click();
      await flushPromises();
      expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ message: 'showEditor.template.replaceConfirm' }));
      expect(editor.applyTemplate).not.toHaveBeenCalled();

      button?.click();
      await flushPromises();
      expect(editor.applyTemplate).toHaveBeenCalledWith(template);
    });
  });
});
