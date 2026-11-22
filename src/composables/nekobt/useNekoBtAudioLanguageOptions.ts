import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { nekoBtAudioLanguages } from '@/data/nekobt/nekoBtAudioLanguages';

/**
 * Provides "Any" and one chip per offered audio language, named in the app language, such as "Latin American Spanish".
 * @returns The options.
 */
export const useNekoBtAudioLanguageOptions = () => {
  const { locale, t } = useI18n();

  return {
    options: computed(() => {
      const names = new Intl.DisplayNames([locale.value], { type: 'language' });

      return [
        { value: 'any', text: t('torrents.filters.anyLanguage'), icon: 'mdi-earth' },
        ...nekoBtAudioLanguages.map((code) => ({ value: code, text: names.of(code) ?? code })),
      ];
    }),
  };
};
