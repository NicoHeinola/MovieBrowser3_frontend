import { i18n } from '@/plugins/i18n';

export const urlRule = (value: string) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' || i18n.global.t('rules.invalidHttpUrl');
  } catch {
    return i18n.global.t('rules.invalidHttpUrl');
  }
};
