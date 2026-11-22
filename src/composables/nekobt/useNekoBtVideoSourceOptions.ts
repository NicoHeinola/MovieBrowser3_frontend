import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { NekoBtVideoSource } from '@/enums/nekobt/NekoBtVideoSource';

/**
 * Provides one chip per nekoBT video source.
 * @returns The options.
 */
export const useNekoBtVideoSourceOptions = () => {
  const { t } = useI18n();

  return {
    options: computed(() =>
      Object.values(NekoBtVideoSource).map((source) => ({ value: source, text: t(`torrents.videoSource.${source}`) })),
    ),
  };
};
