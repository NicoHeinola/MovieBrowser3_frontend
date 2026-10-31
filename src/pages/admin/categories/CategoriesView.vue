<script setup lang="ts">
import type { ShowSectionFormData } from '@/components/features/show-section-edit-dialog';
import type { Category } from '@/interfaces/api/models/Category';
import type { ShowSection } from '@/interfaces/api/models/ShowSection';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { useQueryClient } from '@tanstack/vue-query';
import { ref, watch } from 'vue';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { CategoryEditDialog } from '@/components/features/category-edit-dialog';
import { ShowSectionEditDialog } from '@/components/features/show-section-edit-dialog';
import { ShowSectionList } from '@/components/features/show-section-list';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { CategoryQueryKey } from '@/enums/query/categoryQueryKey';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { ShowSectionQueryKey } from '@/enums/query/showSectionQueryKey';
import { categoryService } from '@/services/show/categoryService';
import { showSectionService } from '@/services/show/showSectionService';
import { deepClone } from '@/utils/clone/deepClone';

const showSections = ref<ShowSection[]>([]);
const isSavingSectionOrder = ref<boolean>(false);

const dialog = useDialog();
const queryClient = useQueryClient();
const { showAPIErrorSnackbar } = useCommonSnackbar();

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

const showSectionsQuery = useAPIQuery<PaginatedResponse<ShowSection>>({
  queryKey: [ShowSectionQueryKey.AdminShowSections],
  queryFn: async () => {
    return await showSectionService.list({
      sort: 'sort_order',
      page: { number: 0, size: 0 },
    });
  },
  placeholderData: (previousData) => previousData,
});

/**
 * Home builds its carousels from sections and their categories, so drop its cache after admin changes.
 *
 * @returns Nothing.
 */
const invalidateHomeShows = async (): Promise<void> => {
  await queryClient.invalidateQueries({ queryKey: [ShowQueryKey.HomeShows] });
};

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
    /** Deleting a category also removes its frontpage section on the backend. */
    await Promise.all([categoriesQuery.refetch(), showSectionsQuery.refetch(), invalidateHomeShows()]);
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
    await Promise.all([showSectionsQuery.refetch(), invalidateHomeShows()]);
  }
};

/**
 * Persist the dragged order by renumbering sections from 0 and patching only those whose position changed.
 *
 * @param sections Sections in their new visual order.
 * @returns Nothing.
 */
const saveShowSectionOrder = async (sections: ShowSection[]): Promise<void> => {
  const changedSections = sections.filter((section, index) => section.sort_order !== index);

  if (changedSections.length === 0) {
    return;
  }

  isSavingSectionOrder.value = true;

  try {
    await Promise.all(
      sections.map(async (section, index) => {
        if (section.sort_order === index) {
          return;
        }

        await showSectionService.update(section.id, { sort_order: index });
        section.sort_order = index;
      }),
    );

    /** Bring the cache in line with the saved order; the paused watch keeps the screen as-is. */
    await showSectionsQuery.refetch();
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);

    /** Assign directly: the watch is paused while saving, and an unchanged result keeps the same reference. */
    const { data } = await showSectionsQuery.refetch();
    showSections.value = deepClone(data?.data ?? []);
  } finally {
    isSavingSectionOrder.value = false;
    await invalidateHomeShows();
  }
};

watch(
  () => showSectionsQuery.data.value,
  (data) => {
    /** Keep the dragged order on screen until its saves finish. */
    if (isSavingSectionOrder.value) {
      return;
    }

    showSections.value = deepClone(data?.data ?? []);
  },
  { immediate: true },
);
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
              <v-btn icon="mdi-plus" @click="void openEditCategoryDialog()" />
            </div>
          </template>
        </titled-section>
      </v-col>
      <v-col cols="12" lg="6">
        <titled-section subtitle="Decide what categories appear on the frontpage." title="Frontpage categories">
          <v-row>
            <template v-if="showSectionsQuery.isFetching.value && !isSavingSectionOrder">
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
                <v-alert class="flex-0-1" type="info">No categories have been added to the frontpage yet.</v-alert>
              </v-col>
            </template>
          </v-row>

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn :disabled="isSavingSectionOrder" icon="mdi-plus" @click="void openEditShowSectionDialog()" />
            </div>
          </template>
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
