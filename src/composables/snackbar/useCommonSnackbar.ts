import type { SnackbarColor } from '@/components/layouts/snackbar-provider/SnackbarColor';
import type { SnackbarDismissReason } from '@/components/layouts/snackbar-provider/SnackbarDismissReason';
import type { SnackbarPresetOptions } from '@/components/layouts/snackbar-provider/SnackbarPresetOptions';
import { isAxiosError } from 'axios';

import { useSnackbar } from '@/components/layouts/snackbar-provider';

export const useCommonSnackbar = () => {
  const { showSnackbar } = useSnackbar();

  const showPresetSnackbar = (
    presetColor: SnackbarColor,
    presetTimeout: number,
    messageText: string,
    overrides?: SnackbarPresetOptions,
  ): Promise<SnackbarDismissReason> => {
    return showSnackbar({
      message: messageText,
      color: presetColor,
      timeout: overrides?.timeout ?? presetTimeout,
      location: overrides?.location,
      closable: overrides?.closable,
    });
  };

  const showSuccessSnackbar = (message: string, overrides?: SnackbarPresetOptions) =>
    showPresetSnackbar('success', 3000, message, overrides);

  const showErrorSnackbar = (message: string, overrides?: SnackbarPresetOptions) =>
    showPresetSnackbar('error', 5000, message, overrides);

  const showWarningSnackbar = (message: string, overrides?: SnackbarPresetOptions) =>
    showPresetSnackbar('warning', 4000, message, overrides);

  const showAPIErrorSnackbar = (error: unknown): string => {
    let message = 'Something went wrong. Please try again.';

    if (isAxiosError(error)) {
      const responseData = error.response?.data;

      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        const potentialMessage = responseData.message;

        if (typeof potentialMessage === 'string' && potentialMessage !== '') {
          message = potentialMessage;
        }
      } else if (error.response?.status === 401) {
        message = 'Your session is no longer valid. Please log in again.';
      } else if ((error.response?.status ?? 0) >= 500) {
        message = 'The server could not process your request. Please try again.';
      }
    } else if (error instanceof Error && error.message !== '') {
      message = error.message;
    }

    showErrorSnackbar(message);

    return message;
  };

  return {
    showAPIErrorSnackbar,
    showErrorSnackbar,
    showSuccessSnackbar,
    showWarningSnackbar,
  };
};
