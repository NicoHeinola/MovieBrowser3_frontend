import { requiredRule } from '@/rules/requiredRule';
import { urlRule } from '@/rules/urlRule';

export const getRules = () => {
  return {
    url: [(value: string) => requiredRule(value.trim()), (value: string) => urlRule(value.trim())],
  };
};
