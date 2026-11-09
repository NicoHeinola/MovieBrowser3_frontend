import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getWatchStatusColor } from '@/utils/show/getWatchStatusColor';
import { getWatchStatusIcon } from '@/utils/show/getWatchStatusIcon';

/**
 * Provides a chip for every watch status.
 * @returns The options.
 */
export const useEntryWatchStatusOptions = () => {
  const { t } = useI18n();

  return {
    options: computed(() =>
      Object.values(WatchStatus).map((status) => ({
        value: status,
        text: t(`showEntry.watchStatus.${status}`),
        icon: getWatchStatusIcon(status),
        color: getWatchStatusColor(status),
      })),
    ),
  };
};
