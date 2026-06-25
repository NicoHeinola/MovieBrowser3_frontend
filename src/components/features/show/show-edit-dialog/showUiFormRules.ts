import type { ShowUiFormData } from './ShowUiFormData';
import { urlRule } from '@/rules/urlRule';
import { isYouTubeUrl } from '@/utils/youtube/isYouTubeUrl';

export const getRules = (_formData: ShowUiFormData | null) => {
  return {
    bannerUrl: [(value: string) => urlRule(value)],
    cardImageUrl: [(value: string) => urlRule(value)],
    previewUrl: [
      (value: string) => !value || urlRule(value),
      (value: string) => !value || isYouTubeUrl(value) || 'Must be a valid YouTube URL',
    ],
  };
};
