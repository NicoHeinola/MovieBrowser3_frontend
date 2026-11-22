import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { nyaaTrustFilters } from '@/data/nyaa/nyaaTrustFilters';

/**
 * nyaa's trust filters as filter chips, translated.
 * @returns `options`, one chip per filter with its icon.
 */
export const useNyaaTrustOptions = () => {
  const { t } = useI18n();

  const options = computed(() =>
    nyaaTrustFilters.map((filter) => ({ value: filter.value, text: t(filter.titleKey), icon: filter.icon })),
  );

  return { options };
};
