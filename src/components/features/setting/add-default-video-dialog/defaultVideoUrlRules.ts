import { i18n } from '@/plugins/i18n';
import { requiredRule } from '@/rules/requiredRule';
import { isYouTubeUrl } from '@/utils/youtube/isYouTubeUrl';

export const getRules = () => {
  return {
    url: [
      (value: string) => requiredRule(value.trim()),
      (value: string) => isYouTubeUrl(value.trim()) || i18n.global.t('rules.invalidYouTubeUrl'),
    ],
  };
};
