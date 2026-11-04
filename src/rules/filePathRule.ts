import { i18n } from '@/plugins/i18n';

/** Linux paths only: the app runs in WSL2, where a Windows drive is /mnt/g, not G:\. */
const absolutePathPattern = /^\/(?:[^/\0]+(?:\/[^/\0]+)*)?\/?$/;

export const filePathRule = (value: string): true | string => {
  if (!value) {
    return true;
  }

  return absolutePathPattern.test(value) || i18n.global.t('rules.invalidFilePath');
};
