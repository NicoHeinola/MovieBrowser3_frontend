import type { StringRule } from '@/rules/stringRule';

import { requiredRule } from '@/rules/requiredRule';

export const usernameFormRules: StringRule[] = [requiredRule];
