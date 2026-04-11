import type { StringRule } from '@/rules/stringRule';

import { requiredRule } from '@/rules/requiredRule';

const isValidUrl = (value: string): boolean => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const defaultBackgroundUrlRules: StringRule[] = [
  (value: string) => requiredRule(value.trim()),
  (value: string) => isValidUrl(value.trim()) || 'Enter a valid http or https URL',
];