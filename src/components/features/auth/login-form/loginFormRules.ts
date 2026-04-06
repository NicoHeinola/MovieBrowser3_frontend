import type { StringRule } from '@/rules/stringRule';

import { emailRule } from '@/rules/emailRule';
import { requiredRule } from '@/rules/requiredRule';

export const loginEmailRules: StringRule[] = [requiredRule, emailRule];

export const loginPasswordRules: StringRule[] = [requiredRule];
