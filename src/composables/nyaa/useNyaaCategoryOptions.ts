import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { nyaaCategories } from '@/data/nyaa/nyaaCategories';

/**
 * The nyaa categories as filter chips, translated.
 * @returns `options`, one chip per category with its icon.
 */
export const useNyaaCategoryOptions = () => {
  const { t } = useI18n();

  const options = computed(() =>
    nyaaCategories.map((category) => ({ value: category.value, text: t(category.titleKey), icon: category.icon })),
  );

  return { options };
};
