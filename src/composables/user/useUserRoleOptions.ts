import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Provides the admin chip.
 * @returns The options.
 */
export const useUserRoleOptions = () => {
  const { t } = useI18n();

  return {
    options: computed(() => [{ value: 'admin', text: t('user.admin'), icon: 'mdi-shield-crown' }]),
  };
};
