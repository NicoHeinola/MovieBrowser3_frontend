import { requiredRule } from '@/rules/requiredRule';

export const getRules = () => {
  return {
    category_id: [requiredRule],
    description: [],
  };
};
