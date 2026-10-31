<script setup lang="ts">
import type { UserFormData } from '@/components/features/user/user-edit-dialog';
import type { User } from '@/interfaces/api/models/User';

import { ref } from 'vue';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { FloatingPagination } from '@/components/common/floating-pagination';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { ResultCount } from '@/components/common/result-count';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { UserEditDialog } from '@/components/features/user/user-edit-dialog';
import { UserFilterDrawer } from '@/components/features/user/user-filter-drawer';
import { UserTable } from '@/components/features/user/user-table';
import { useDialog } from '@/components/layouts/dialog-provider';
import { userSortOptions } from '@/composables/user/userSortOptions';
import { useUserSearch } from '@/composables/user/useUserSearch';

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
      :sort-options="userSortOptions"
      placeholder="Search users..."
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
              No users match these filters
              <v-btn color="info" size="small" variant="text" @click="clearFilters">Clear filters</v-btn>
            </div>
            <template v-else>No users found</template>
          </template>
        </user-table>
      </v-col>
    </v-row>

    <floating-pagination v-model:page="page" :length="totalPages" class="mb-6" />
    <floating-action-button class="z-100" icon="mdi-plus" @click="openEditUserDialog()" />

    <user-filter-drawer
      v-model:filters="filters"
      v-model:is-shown="isFilterDrawerVisible"
      :active-filter-count="activeFilterCount"
      :is-loading="isLoading"
      :total-results="totalResults"
      @clear="clearFilters"
    />
  </page-container>
</template>
