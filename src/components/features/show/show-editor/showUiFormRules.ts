import type { ShowUiFormData } from './ShowUiFormData';
import { i18n } from '@/plugins/i18n';
import { urlRule } from '@/rules/urlRule';
import { isYouTubeUrl } from '@/utils/youtube/isYouTubeUrl';

export const getRules = (_formData: ShowUiFormData | null) => {
  return {
    bannerUrl: [(value: string) => urlRule(value)],
    cardImageUrl: [(value: string) => urlRule(value)],
    previewUrl: [
      (value: string) => !value || urlRule(value),
      (value: string) => !value || isYouTubeUrl(value) || i18n.global.t('rules.invalidYouTubeUrl'),
    ],
  };
};
