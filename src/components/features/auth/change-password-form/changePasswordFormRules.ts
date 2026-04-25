import { requiredRule } from '@/rules/requiredRule';

export const getRules = (password?: string) => {
  return {
    password: [requiredRule],
    confirmPassword: [requiredRule, (value: string) => value === password || 'Passwords must match'],
  };
};
