import type { DialogApi } from './DialogApi';
import { inject } from 'vue';

import { dialogApiKey } from './dialogApiKey';

export const useDialog = (): DialogApi => {
  const dialog = inject(dialogApiKey, null);

  if (dialog === null) {
    throw new Error('useDialog must be used within DialogProvider.');
  }

  return dialog;
};
