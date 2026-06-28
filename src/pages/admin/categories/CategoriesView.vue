<script setup lang="ts">
import type { Category } from '@/interfaces/api/models/Category';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { CategoryEditDialog } from '@/components/features/category-edit-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { CategoryQueryKey } from '@/enums/query/categoryQueryKey';
import { categoryService } from '@/services/show/categoryService';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { deepClone } from '@/utils/clone/deepClone';

const dialog = useDialog();
const settingStore = useSettingStore();

const categoriesQuery = useAPIQuery<PaginatedResponse<Category>>({
  queryKey: [CategoryQueryKey.AdminCategories],
  queryFn: async () => {
    return await categoryService.list({
      sort: '-name',
      page: { number: 0, size: 0 },
    });
  },
  placeholderData: (previousData) => previousData,
});

const getEmptyCategory = (): Category => {
  return {
    id: 0,
    name: '',
    value: '',
    icon: 'mdi-tag-outline',
  };
};

const openEditCategoryDialog = async (category?: Category): Promise<void> => {
  const refresh = await dialog.showDialog({
    component: CategoryEditDialog,
    props: {
      category: category ? deepClone(category) : getEmptyCategory(),
    },
  });

  if (refresh) {
    await categoriesQuery.refetch();
  }
};
</script>

<template>
  <page-background />
  <page-container>
    <v-row class="position-relative">
      <v-col cols="12" lg="6">
        <titled-section subtitle="These can be added to shows and movies." title="Categories">
          <v-row>
            <template v-if="categoriesQuery.isFetching.value">
              <v-col v-for="n in 6" class="d-flex" cols="12" lg="6" xl="4" :key="n">
                <v-skeleton-loader class="rounded-e-0" height="51px" type="text" width="45px" />
                <v-skeleton-loader class="flex-1-1 rounded-0" type="text" />
                <v-skeleton-loader class="rounded-s-0" type="text" width="70px" />
              </v-col>
            </template>

            <template v-else>
              <v-col v-for="category in categoriesQuery.data.value?.data" cols="12" lg="6" xl="4" :key="category.id">
                <v-card>
                  <v-card-text class="d-flex ga-2 align-center py-2">
                    <v-icon>{{ category.icon }}</v-icon>
                    <p class="text-truncate">
                      {{ category.name }}
                      <v-tooltip activator="parent">
                        {{ category.name }}
                      </v-tooltip>
                    </p>
                    <v-spacer />
                    <v-btn variant="text" @click="openEditCategoryDialog(category)">Edit</v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </template>
          </v-row>

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn :loading="settingStore.isLoading" icon="mdi-plus" @click="void openEditCategoryDialog()" />
            </div>
          </template>
        </titled-section>
      </v-col>
      <v-col cols="12" lg="6">
        <titled-section subtitle="Decide what categories appear on the frontpage." title="Frontpage categories">
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
