import { requiredRule } from '@/rules/requiredRule';

export const getRules = () => {
  return {
    username: [requiredRule],
    password: [requiredRule],
  };
};
