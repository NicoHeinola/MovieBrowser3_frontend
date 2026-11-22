import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { NekoBtVideoCodec } from '@/enums/nekobt/NekoBtVideoCodec';

/**
 * Provides one chip per nekoBT video codec.
 * @returns The options.
 */
export const useNekoBtVideoCodecOptions = () => {
  const { t } = useI18n();

  return {
    options: computed(() =>
      Object.values(NekoBtVideoCodec).map((codec) => ({ value: codec, text: t(`torrents.videoCodec.${codec}`) })),
    ),
  };
};
