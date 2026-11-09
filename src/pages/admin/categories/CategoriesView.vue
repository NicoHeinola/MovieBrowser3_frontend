<script setup lang="ts">
import type { ShowSectionFormData } from '@/components/features/show-section-edit-dialog';
import type { Category } from '@/interfaces/api/models/Category';
import type { ShowSection } from '@/interfaces/api/models/ShowSection';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { useI18n } from 'vue-i18n';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { CategoryEditDialog } from '@/components/features/category-edit-dialog';
import { ShowSectionEditDialog } from '@/components/features/show-section-edit-dialog';
import { ShowSectionList } from '@/components/features/show-section-list';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useShowSections } from '@/composables/show/useShowSections';
import { CategoryQueryKey } from '@/enums/query/categoryQueryKey';
import { categoryService } from '@/services/show/categoryService';
import { deepClone } from '@/utils/clone/deepClone';

const dialog = useDialog();
const { t } = useI18n();
const {
  sections: showSections,
  isLoading: isLoadingShowSections,
  isSavingOrder: isSavingSectionOrder,
  saveOrder: saveShowSectionOrder,
  refresh: refreshShowSections,
} = useShowSections();

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
    // Deleting a category also removes its frontpage section on the backend.
    await Promise.all([categoriesQuery.refetch(), refreshShowSections()]);
  }
};

const getEmptyShowSection = (): ShowSectionFormData => {
  const sections = showSections.value;
  const nextSortOrder = sections.length > 0 ? Math.max(...sections.map((section) => section.sort_order)) + 1 : 0;

  return {
    id: 0,
    description: null,
    sort_order: nextSortOrder,
  };
};

const openEditShowSectionDialog = async (showSection?: ShowSection): Promise<void> => {
  const refresh = await dialog.showDialog({
    component: ShowSectionEditDialog,
    props: {
      showSection: showSection ? deepClone(showSection) : getEmptyShowSection(),
      usedCategoryIds: showSections.value
        .filter((section) => section.id !== showSection?.id)
        .map((section) => section.category_id),
    },
  });

  if (refresh) {
    await refreshShowSections();
  }
};
</script>

<template>
  <page-background />
  <page-container>
    <v-row class="position-relative">
      <v-col cols="12" lg="6">
        <titled-section :subtitle="t('categories.subtitle')" :title="t('categories.title')">
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
                    <v-btn variant="text" @click="openEditCategoryDialog(category)">{{ t('common.edit') }}</v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </template>
          </v-row>

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn color="primary" icon="mdi-plus" @click="void openEditCategoryDialog()" />
            </div>
          </template>
        </titled-section>
      </v-col>
      <v-col cols="12" lg="6">
        <titled-section :subtitle="t('categories.frontpageSubtitle')" :title="t('categories.frontpageTitle')">
          <v-row>
            <template v-if="isLoadingShowSections">
              <v-col v-for="n in 4" class="d-flex" cols="12" :key="n">
                <v-skeleton-loader class="rounded-e-0" height="51px" type="text" width="45px" />
                <v-skeleton-loader class="flex-1-1 rounded-0" type="text" />
                <v-skeleton-loader class="rounded-s-0" type="text" width="70px" />
              </v-col>
            </template>

            <template v-else>
              <v-col cols="12" v-if="showSections.length > 0">
                <show-section-list
                  v-model:sections="showSections"
                  :disabled="isSavingSectionOrder"
                  @edit="openEditShowSectionDialog"
                  @reorder="saveShowSectionOrder"
                />
              </v-col>

              <v-col class="d-flex" cols="12" v-else>
                <v-alert class="flex-0-1" type="info">{{ t('categories.frontpageEmpty') }}</v-alert>
              </v-col>
            </template>
          </v-row>

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn
                :disabled="isSavingSectionOrder"
                color="primary"
                icon="mdi-plus"
                @click="void openEditShowSectionDialog()"
              />
            </div>
          </template>
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
