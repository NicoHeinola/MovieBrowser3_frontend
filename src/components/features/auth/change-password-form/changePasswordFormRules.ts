import { i18n } from '@/plugins/i18n';
import { requiredRule } from '@/rules/requiredRule';

/**
 * Build the change password form rules.
 *
 * @param getPassword Returns the current password so the confirmation is compared against live input.
 * @returns Rules keyed by form field.
 */
export const getRules = (getPassword: () => string) => {
  return {
    password: [requiredRule],
    confirmPassword: [
      requiredRule,
      (value: string) => value === getPassword() || i18n.global.t('common.passwordsMustMatch'),
    ],
  };
};
