import { maxLengthRule } from '@/rules/maxLengthRule';
import { requiredRule } from '@/rules/requiredRule';

/**
 * Builds the tag form rules, mirroring the backend limits. Unique names are checked by the backend.
 * @returns The rules per field.
 */
export const getRules = () => {
  return {
    name: [(value: string) => requiredRule((value ?? '').trim()), maxLengthRule(100)],
  };
};
