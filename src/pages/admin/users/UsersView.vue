<script setup lang="ts">
import type { UserFormData } from '@/components/features/user/user-edit-dialog';
import type { User } from '@/interfaces/api/models/User';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { SearchFilterDrawer } from '@/components/common/filter-drawer';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { FloatingPagination } from '@/components/common/floating-pagination';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { ResultCount } from '@/components/common/result-count';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { UserEditDialog } from '@/components/features/user/user-edit-dialog';
import { UserTable } from '@/components/features/user/user-table';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useUserSearch } from '@/composables/user/useUserSearch';
import { userSearchFilterDefinitions } from '@/data/user/userSearchFilterDefinitions';
import { userSortOptions } from '@/data/user/userSortOptions';

const isFilterDrawerVisible = ref<boolean>(false);

const {
  searchInput,
  filters,
  activeFilterCount,
  clearFilters,
  sort,
  page,
  query: usersQuery,
  users,
  totalPages,
  totalResults,
  isLoading,
} = useUserSearch();

const dialog = useDialog();
const { t } = useI18n();

/**
 * Builds the dialog form for a user, or an empty one for creating a user.
 *
 * @param user The user to edit. Leave it out to create one.
 * @returns The form data with blank passwords.
 */
const getUserFormData = (user?: User): UserFormData => {
  return {
    id: user?.id ?? 0,
    username: user?.username ?? '',
    is_admin: user?.is_admin ?? false,
    password: '',
    password_confirmation: '',
  };
};

const openEditUserDialog = async (user?: User): Promise<void> => {
  const refresh = await dialog.showDialog({
    component: UserEditDialog,
    props: {
      user: getUserFormData(user),
    },
  });

  if (refresh) {
    await usersQuery.refetch();
  }
};
</script>

<template>
  <page-background />
  <page-container class="mb-12">
    <search-toolbar
      v-model:search="searchInput"
      v-model:sort="sort"
      :active-filter-count="activeFilterCount"
      :placeholder="t('users.searchPlaceholder')"
      :sort-options="userSortOptions"
      @click:filters="isFilterDrawerVisible = true"
    />

    <result-count :count="totalResults" :loading="isLoading" />

    <v-row justify="center">
      <v-col cols="12" lg="8" md="10" xl="6">
        <user-table
          :is-loading="isLoading"
          :is-pending="usersQuery.isPending.value"
          :users="users"
          @edit="openEditUserDialog"
        >
          <template #no-data>
            <div class="d-flex ga-2 align-center justify-center" v-if="activeFilterCount > 0">
              {{ t('users.noMatch') }}
              <v-btn color="info" size="small" variant="text" @click="clearFilters">{{
                t('common.clearFilters')
              }}</v-btn>
            </div>
            <template v-else>{{ t('users.none') }}</template>
          </template>
        </user-table>
      </v-col>
    </v-row>

    <floating-pagination v-model:page="page" :length="totalPages" class="mb-6" />
    <floating-action-button class="z-100" icon="mdi-plus" @click="openEditUserDialog()" />

    <search-filter-drawer
      v-model:filters="filters"
      v-model:is-shown="isFilterDrawerVisible"
      :active-filter-count="activeFilterCount"
      :definitions="userSearchFilterDefinitions"
      :is-loading="isLoading"
      :total-results="totalResults"
      @clear="clearFilters"
    />
  </page-container>
</template>
