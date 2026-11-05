import type { UserSearchFilters } from './UserSearchFilters';
import type { ChipsFilterValue } from '@/composables/search/ChipsFilterValue';
import type { SearchFilterDefinition } from '@/composables/search/SearchFilterDefinition';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { SearchFilterType } from '@/enums/search/SearchFilterType';

/**
 * Provides the admin chip.
 * @returns The options.
 */
const useRoleOptions = () => {
  const { t } = useI18n();

  return {
    options: computed(() => [{ value: 'admin', text: t('user.admin'), icon: 'mdi-shield-crown' }]),
  };
};

/**
 * Builds the backend params of the role filter, which takes one `is_admin` flag instead of value lists.
 * @param value - The chips selection.
 * @returns The params, empty when the chip is off.
 */
const getRoleApiParams = ({ included, excluded }: ChipsFilterValue): Record<string, string> => {
  if (included.length > 0) {
    return { is_admin: '1' };
  }

  return excluded.length > 0 ? { is_admin: '0' } : {};
};

/** The filters of the user search, in drawer and URL order. */
export const userSearchFilterDefinitions: SearchFilterDefinition<keyof UserSearchFilters>[] = [
  {
    key: 'role',
    type: SearchFilterType.Chips,
    param: 'role',
    title: 'user.role',
    hint: { keypath: 'user.roleHint', include: 'include', exclude: 'exclude' },
    api: getRoleApiParams,
    useOptions: useRoleOptions,
  },
];
