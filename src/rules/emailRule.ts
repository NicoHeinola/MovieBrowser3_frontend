import type { StringRule } from './stringRule';

export const emailRule: StringRule = (value: string) => /.+@.+\..+/.test(value) || 'Enter a valid email address';
