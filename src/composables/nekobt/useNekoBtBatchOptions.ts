import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Provides the batch choices: every release, batches only or single releases only.
 * @returns The options.
 */
export const useNekoBtBatchOptions = () => {
  const { t } = useI18n();

  return {
    options: computed(() => [
      { value: 'any', text: t('torrents.filters.batchAny'), icon: 'mdi-all-inclusive' },
      { value: 'true', text: t('torrents.filters.batchOnly'), icon: 'mdi-folder-multiple' },
      { value: 'false', text: t('torrents.filters.batchNone'), icon: 'mdi-file-video-outline' },
    ]),
  };
};
