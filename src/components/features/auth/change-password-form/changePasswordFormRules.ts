import type { StringRule } from '@/rules/stringRule';

import { requiredRule } from '@/rules/requiredRule';

export const changePasswordRules: StringRule[] = [requiredRule];

export const getChangePasswordConfirmRules = (password: string): StringRule[] => [
  requiredRule,
  (value: string) => value === password || 'Passwords must match',
];
