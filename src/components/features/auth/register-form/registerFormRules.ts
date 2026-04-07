import type { StringRule } from '@/rules/stringRule';

import { requiredRule } from '@/rules/requiredRule';

export const registerUsernameRules: StringRule[] = [requiredRule];

export const registerPasswordRules: StringRule[] = [requiredRule];

export const getRegisterConfirmPasswordRules = (password: string): StringRule[] => [
  requiredRule,
  (value: string) => value === password || 'Passwords must match',
];
