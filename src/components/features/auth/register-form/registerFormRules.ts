import { requiredRule } from '@/rules/requiredRule';

export const getRules = (password?: string) => {
  return {
    username: [requiredRule],
    password: [requiredRule],
    confirmPassword: [requiredRule, (value: string) => value === password || 'Passwords must match'],
  };
};
