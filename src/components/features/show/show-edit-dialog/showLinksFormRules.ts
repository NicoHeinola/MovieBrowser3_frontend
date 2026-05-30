import { requiredRule } from '@/rules/requiredRule';

export const getLinksRules = () => {
  return {
    linkType: [(value: string) => requiredRule(value)],
    linkedShow: [(value: unknown) => requiredRule(value ? 'true' : '')],
  };
};
