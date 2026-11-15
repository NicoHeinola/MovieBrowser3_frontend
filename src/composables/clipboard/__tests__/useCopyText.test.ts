import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCopyText } from '../useCopyText';

const copy = vi.fn();
const showErrorSnackbar = vi.fn();
const showSuccessSnackbar = vi.fn();

vi.mock('@vueuse/core', () => ({
  useClipboard: () => ({ copy }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showErrorSnackbar, showSuccessSnackbar }),
}));

describe('useCopyText', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('copies the text and says so', async () => {
    await useCopyText().copyText('moviebrowser3 update');

    expect(copy).toHaveBeenCalledWith('moviebrowser3 update');
    expect(showSuccessSnackbar).toHaveBeenCalledWith('common.copied');
  });

  it('says when the clipboard refused the text', async () => {
    copy.mockRejectedValue(new Error('denied'));

    await useCopyText().copyText('moviebrowser3 update');

    expect(showErrorSnackbar).toHaveBeenCalledWith('common.copyFailed');
    expect(showSuccessSnackbar).not.toHaveBeenCalled();
  });

  it('shows the messages it is given', async () => {
    await useCopyText().copyText('https://example.com', { success: 'URL copied.' });

    expect(showSuccessSnackbar).toHaveBeenCalledWith('URL copied.');
  });
});
