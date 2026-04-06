import type { StringRule } from '@/rules/stringRule';

import { emailRule } from '@/rules/emailRule';
import { requiredRule } from '@/rules/requiredRule';

export const registerEmailRules: StringRule[] = [requiredRule, emailRule];

export const registerPasswordRules: StringRule[] = [
  requiredRule,
  (value: string) => value.length >= 8 || 'Password must be at least 8 characters',
];

export const getRegisterConfirmPasswordRules = (password: string): StringRule[] => [
  requiredRule,
  (value: string) => value === password || 'Passwords must match',
];
