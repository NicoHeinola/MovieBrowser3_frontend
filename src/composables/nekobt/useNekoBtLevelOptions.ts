import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { NEKOBT_BADGE_STYLES } from '@/data/nekobt/nekoBtBadgeStyles';
import { NekoBtLevel } from '@/enums/nekobt/NekoBtLevel';

/**
 * Provides one chip per nekoBT level, in its badge color.
 * @returns The options.
 */
export const useNekoBtLevelOptions = () => {
  const { t } = useI18n();

  return {
    options: computed(() =>
      Object.values(NekoBtLevel).map((level) => ({
        value: level,
        text: t(`torrents.level.${level}`),
        color: NEKOBT_BADGE_STYLES.levelColors[level],
      })),
    ),
  };
};
