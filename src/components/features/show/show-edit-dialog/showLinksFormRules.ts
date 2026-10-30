import { requiredRule } from '@/rules/requiredRule';

export const getRules = () => {
  return {
    linkType: [(value: string) => requiredRule(value)],
    linkedShow: [(value: unknown) => requiredRule(value ? 'true' : '')],
  };
};
