<script setup lang="ts">
import type { ShowEntryFormData } from './ShowEntryFormData';
import type { MalSearchDialogProps } from '@/components/features/mal/mal-search-dialog';
import type { MalAnime } from '@/interfaces/api/models/MalAnime';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { MalSearchDialog } from '@/components/features/mal/mal-search-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { urlRule } from '@/rules/urlRule';
import { getWebsiteHostname } from '@/utils/website/url/getWebsiteHostname';
import { getRules } from './showEntriesFormRules';

const { showTitle = '' } = defineProps<{
  /** The show's primary title, which the MyAnimeList search starts from. */
  showTitle?: string;
}>();

const entry = defineModel<ShowEntryFormData>('entry', { required: true });

const dialog = useDialog();
const { t } = useI18n();

const rules = computed(() => getRules({ entries: [entry.value] }));

/** The entry's link when it is a valid web address, so the open button never opens a half-typed one. */
const validUrl = computed<string | null>(() => {
  const url = (entry.value.url ?? '').trim();

  return url && urlRule(url) === true ? url : null;
});

const entryTypeOptions = computed(() => [
  { title: t('showEntry.type.season'), value: ShowEntryType.Season },
  { title: t('showEntry.type.tv_special'), value: ShowEntryType.TvSpecial },
  { title: t('showEntry.type.movie'), value: ShowEntryType.Movie },
]);

/**
 * Searches MyAnimeList, starting from the show's title, and puts the picked anime's page in the link field. The
 * entry's name stays out: MAL names seasons its own way, so "Season 2" often finds nothing.
 * @returns Nothing.
 */
const searchMal = async (): Promise<void> => {
  const anime = await dialog.showDialog<MalAnime, Pick<MalSearchDialogProps, 'initialSearch'>>({
    component: MalSearchDialog,
    props: { initialSearch: showTitle },
  });

  if (anime) {
    entry.value.url = anime.url;
  }
};

/**
 * Opens the entry's link in a new tab.
 * @returns Nothing.
 */
const openUrl = (): void => {
  if (validUrl.value) {
    window.open(validUrl.value, '_blank', 'noopener');
  }
};
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-text-field v-model="entry.name" :label="t('show.entryName')" :rules="rules.name" class="required" />
    </v-col>
    <v-col cols="12">
      <v-select
        v-model="entry.type"
        :items="entryTypeOptions"
        :label="t('show.entryType')"
        :rules="rules.type"
        class="required"
        item-title="title"
        item-value="value"
      />
    </v-col>
    <v-col cols="12">
      <div class="d-flex ga-2 align-center">
        <v-text-field v-model="entry.url" :label="t('show.entryUrl')" :rules="rules.url" clearable>
          <!-- A help icon, not a hint below the field, so the buttons beside it stay level with it -->
          <template #prepend>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('show.entryUrlHint')" />
          </template>
        </v-text-field>
        <v-btn icon="mdi-magnify" size="x-small" @click="void searchMal()" v-tooltip:bottom="t('mal.searchTitle')" />
        <v-btn
          :disabled="!validUrl"
          icon="mdi-open-in-new"
          size="x-small"
          @click="openUrl"
          v-tooltip:bottom="t('show.openEntryUrl', { site: validUrl ? getWebsiteHostname(validUrl) : '' })"
        />
      </div>
    </v-col>
  </v-row>
</template>
