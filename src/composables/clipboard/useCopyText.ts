import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';

/** The snackbar messages `copyText` shows instead of the common ones. */
export interface CopyTextMessages {
  /** Shown once the text is copied. */
  success?: string;
  /** Shown when the clipboard refused the text. */
  error?: string;
}

/**
 * Copies text to the clipboard and tells the user whether it worked.
 * @returns `copyText`, which copies one text.
 */
export const useCopyText = () => {
  const { copy } = useClipboard({ legacy: true });
  const { showErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  /**
   * Copies the text and shows a snackbar with the result.
   * @param text - The text to copy.
   * @param messages - Messages to show instead of the common "copied" and "could not copy" ones.
   * @returns Nothing.
   */
  const copyText = async (text: string, messages: CopyTextMessages = {}): Promise<void> => {
    try {
      await copy(text);
      showSuccessSnackbar(messages.success ?? t('common.copied'));
    } catch {
      showErrorSnackbar(messages.error ?? t('common.copyFailed'));
    }
  };

  return { copyText };
};
