import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { WATCH_STATUS_STYLES } from '@/utils/show/watch-status/watchStatusStyles';

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
        icon: WATCH_STATUS_STYLES[status].icon,
        color: WATCH_STATUS_STYLES[status].color,
      })),
    ),
  };
};
