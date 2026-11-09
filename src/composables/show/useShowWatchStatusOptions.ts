import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { MIXED_WATCH_STATUS } from '@/utils/show/mixedWatchStatus';
import { MIXED_WATCH_STATUS_COLOR } from '@/utils/show/mixedWatchStatusColor';
import { MIXED_WATCH_STATUS_ICON } from '@/utils/show/mixedWatchStatusIcon';
import { useEntryWatchStatusOptions } from './useEntryWatchStatusOptions';

/**
 * Provides the watch status chips of a whole show, which adds one for shows whose entries differ.
 * @returns The options.
 */
export const useShowWatchStatusOptions = () => {
  const { t } = useI18n();
  const { options } = useEntryWatchStatusOptions();

  return {
    options: computed(() => [
      ...options.value,
      {
        value: MIXED_WATCH_STATUS,
        text: t('show.mixed'),
        icon: MIXED_WATCH_STATUS_ICON,
        color: MIXED_WATCH_STATUS_COLOR,
      },
    ]),
  };
};
