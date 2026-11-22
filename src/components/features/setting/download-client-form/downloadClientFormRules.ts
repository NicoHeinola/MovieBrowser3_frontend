import { filePathRule } from '@/rules/filePathRule';
import { urlRule } from '@/rules/urlRule';

export const getRules = () => {
  return {
    // Empty is allowed: it turns downloads off.
    url: [(value: string) => value.trim() === '' || urlRule(value.trim())],
    downloadPath: [(value: string) => filePathRule(value.trim())],
  };
};
