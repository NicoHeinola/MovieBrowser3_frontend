<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import { onKeyStroke } from '@vueuse/core';
import { ref, useTemplateRef, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { ShowListItem } from '../show-list-item';
import { useShowSearchMenu } from './useShowSearchMenu';

const emit = defineEmits<{
  'select:show': [show: Show];
}>();

const isMenuShown = ref<boolean>(false);
const searchField = useTemplateRef<{ focus: () => void }>('searchField');

const { mdAndUp } = useDisplay();
const { search, term, shows, totalResults, isLoading, openSearchPage } = useShowSearchMenu();

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
          class="glass-panel rounded-xl"
          color="link"
          placeholder="Search shows..."
          prepend-inner-icon="mdi-magnify"
          rounded="xl"
          clearable
          hide-details
          @click="openMenu"
          @keydown.enter="submit"
          @keydown.esc="isMenuShown = false"
          ref="searchField"
        />
      </div>
    </template>

    <v-card class="glass-panel mt-2" rounded="xl" border>
      <v-list bg-color="transparent" class="overflow-y-auto" style="max-height: 440px">
        <template v-if="isLoading">
          <v-skeleton-loader v-for="i in 3" color="transparent" type="list-item-avatar" :key="i" />
        </template>

        <template v-else-if="shows.length > 0">
          <show-list-item
            v-for="show in shows"
            :show="show"
            :subtitle="getCategoryNames(show)"
            @click="selectShow(show)"
            :key="show.id"
          />
        </template>

        <v-list-item title="No matching shows" disabled v-else />
      </v-list>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn prepend-icon="mdi-magnify" variant="flat" block @click="submit">
          {{ totalResults > 0 && !isLoading ? `See all ${totalResults} results` : 'See all results' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
