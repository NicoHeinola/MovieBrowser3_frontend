import { maxLengthRule } from '@/rules/maxLengthRule';
import { requiredRule } from '@/rules/requiredRule';

/**
 * Build the user edit dialog rules.
 *
 * @param isCreating Returns whether a new user is being created, which makes the password required.
 * @param getPassword Returns the current password so the confirmation is compared against live input.
 * @returns Rules keyed by form field.
 */
export const getRules = (isCreating: () => boolean, getPassword: () => string) => {
  const requiredWhenCreating = (value: string) => !isCreating() || requiredRule(value);

  return {
    username: [requiredRule, maxLengthRule(255)],
    password: [requiredWhenCreating],
    confirmPassword: [requiredWhenCreating, (value: string) => value === getPassword() || 'Passwords must match'],
  };
};
