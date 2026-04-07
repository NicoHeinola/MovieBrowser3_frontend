import type { StringRule } from '@/rules/stringRule';

import { requiredRule } from '@/rules/requiredRule';

export const loginUsernameRules: StringRule[] = [requiredRule];

export const loginPasswordRules: StringRule[] = [requiredRule];
