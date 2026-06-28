import { requiredRule } from '@/rules/requiredRule';

export const getRules = () => {
  return {
    name: [requiredRule],
    value: [requiredRule],
    icon: [],
  };
};
