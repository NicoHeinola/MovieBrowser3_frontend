import type {
  SnackbarColor,
  SnackbarDismissReason,
  SnackbarPresetOptions,
} from '@/components/layouts/snackbar-provider';

import { useSnackbar } from '@/components/layouts/snackbar-provider';
import { getApiErrorMessage } from '@/utils/api/getApiErrorMessage';

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
    const message = getApiErrorMessage(error);

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
