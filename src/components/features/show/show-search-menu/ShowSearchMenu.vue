<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import { onKeyStroke } from '@vueuse/core';
import { ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

import { SearchResultList } from '@/components/common/search-result-list';

import { ShowListItem } from '../show-list-item';
import { useShowSearchMenu } from './useShowSearchMenu';

const emit = defineEmits<{
  'select:show': [show: Show];
}>();

const isMenuShown = ref<boolean>(false);
const searchField = useTemplateRef<{ focus: () => void }>('searchField');

const { mdAndUp } = useDisplay();
const { search, term, shows, totalResults, isLoading, openSearchPage } = useShowSearchMenu();
const { t } = useI18n();

/**
 * Lists a show's category names for the suggestion subtitle.
 * @param show - The suggested show.
 * @returns The comma-separated category names.
 */
const getCategoryNames = (show: Show): string => (show.categories ?? []).map((category) => category.name).join(', ');

/**
 * Reopens the suggestions when the field is clicked with a term still in it.
 * @returns void
 */
const openMenu = (): void => {
  isMenuShown.value = term.value !== '';
};

/**
 * Closes the menu and hands the picked show to the caller.
 * @param show - The picked show.
 * @returns void
 */
const selectShow = (show: Show): void => {
  isMenuShown.value = false;
  emit('select:show', show);
};

/**
 * Closes the menu and opens the search page with the typed term.
 * @returns void
 */
const submit = async (): Promise<void> => {
  isMenuShown.value = false;
  await openSearchPage();
};

/**
 * Focuses the search field on Ctrl+K / Cmd+K. Below `md` the navigation hides the field, so the key is left to the
 * browser.
 * @param event - The shortcut key press.
 * @returns void
 */
const focusSearch = (event: KeyboardEvent): void => {
  if (!mdAndUp.value) {
    return;
  }

  event.preventDefault();
  searchField.value?.focus();
};

watch(term, (value) => {
  isMenuShown.value = value !== '';
});

onKeyStroke('k', (event) => {
  if (event.ctrlKey || event.metaKey) {
    focusSearch(event);
  }
});
</script>

<template>
  <v-menu v-model="isMenuShown" :open-on-click="false" location="bottom end" width="380">
    <template #activator="{ props: activatorProps }">
      <!-- The activator props carry the menu's anchor ref, so they go on a wrapper to keep the field's ref free. -->
      <div v-bind="activatorProps">
        <v-text-field
          v-model="search"
          :placeholder="t('show.searchPlaceholder')"
          class="glass-panel rounded-xl"
          color="link"
          prepend-inner-icon="mdi-magnify"
          rounded="xl"
          clearable
          @click="openMenu"
          @keydown.enter="submit"
          @keydown.esc="isMenuShown = false"
          ref="searchField"
        />
      </div>
    </template>

    <v-card class="glass-panel high mt-2" rounded="xl" border>
      <div class="d-flex flex-column py-4">
        <search-result-list :empty-text="t('show.noMatchingShows')" :is-empty="shows.length === 0" :loading="isLoading">
          <show-list-item
            v-for="show in shows"
            :show="show"
            :subtitle="getCategoryNames(show)"
            @click="selectShow(show)"
            :key="show.id"
          />
        </search-result-list>
      </div>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn color="primary" prepend-icon="mdi-magnify" rounded="pill" variant="flat" block @click="submit">
          {{
            totalResults > 0 && !isLoading
              ? t('show.seeAllResultsCount', { count: totalResults })
              : t('show.seeAllResults')
          }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
