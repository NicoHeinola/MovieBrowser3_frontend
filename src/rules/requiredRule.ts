import type { StringRule } from './stringRule';

export const requiredRule: StringRule = (value: string) => Boolean(value) || 'This field is required';
