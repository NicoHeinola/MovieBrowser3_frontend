import { magnetUrlRule } from '@/rules/magnetUrlRule';
import { requiredRule } from '@/rules/requiredRule';

export const getRules = () => {
  return {
    magnetUrl: [requiredRule, magnetUrlRule],
  };
};
